import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CheckStatus } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { computeConfidenceForRun } from "@/lib/confidence";
import { prisma } from "@/lib/prisma";

type VerificationKey = "test" | "lint" | "typecheck";

type VerificationCommand = {
  key: VerificationKey;
  label: string;
  scriptName: string | null;
};

async function readScripts(repoPath: string) {
  try {
    const raw = await fs.readFile(path.join(repoPath, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
    return parsed.scripts || {};
  } catch {
    return {};
  }
}

function resolveCommands(scripts: Record<string, string>): VerificationCommand[] {
  return [
    {
      key: "test",
      label: "Tests",
      scriptName: scripts.test ? "test" : null,
    },
    {
      key: "lint",
      label: "Lint",
      scriptName: scripts.lint ? "lint" : null,
    },
    {
      key: "typecheck",
      label: "Typecheck",
      scriptName: scripts.typecheck
        ? "typecheck"
        : scripts["type-check"]
          ? "type-check"
          : null,
    },
  ];
}

function runNpmScript(repoPath: string, scriptName: string) {
  return new Promise<{
    status: CheckStatus;
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>((resolve) => {
    let stdout = "";
    let stderr = "";
    const child = spawn("npm", ["run", scriptName], {
      cwd: repoPath,
      shell: process.platform === "win32",
      windowsHide: true,
      env: process.env,
    });

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      stderr += `\n${error.message}`;
    });

    child.on("close", (exitCode) => {
      resolve({
        status: exitCode === 0 ? "PASSED" : "FAILED",
        stdout,
        stderr,
        exitCode,
      });
    });
  });
}

function truncate(value: string, maxLength = 6000) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...[truncated]`;
}

export async function runVerificationForRun(runId: string) {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: {
      task: {
        include: { repo: true },
      },
    },
  });

  if (!run) {
    throw new ApiError("Run not found.", 404);
  }

  const executionAlreadyFailed = run.status === "FAILED";

  await prisma.run.update({
    where: { id: runId },
    data: { status: "VERIFYING" },
  });

  const scripts = await readScripts(run.task.repo.localPath);
  const commands = resolveCommands(scripts);
  const statuses: Record<VerificationKey, CheckStatus> = {
    test: "NOT_RUN",
    lint: "NOT_RUN",
    typecheck: "NOT_RUN",
  };
  const notes: string[] = [];

  for (const command of commands) {
    if (!command.scriptName) {
      statuses[command.key] = "SKIPPED";
      notes.push(`${command.label}: skipped because no npm script was found.`);
      continue;
    }

    const result = await runNpmScript(run.task.repo.localPath, command.scriptName);
    statuses[command.key] = result.status;
    notes.push(
      [
        `${command.label}: npm run ${command.scriptName} -> ${result.status}`,
        `exitCode: ${result.exitCode ?? "unknown"}`,
        result.stdout ? `stdout:\n${truncate(result.stdout)}` : "",
        result.stderr ? `stderr:\n${truncate(result.stderr)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  const verification = await prisma.verificationResult.upsert({
    where: { runId },
    create: {
      runId,
      testStatus: statuses.test,
      lintStatus: statuses.lint,
      typecheckStatus: statuses.typecheck,
      notes: notes.join("\n\n---\n\n"),
    },
    update: {
      testStatus: statuses.test,
      lintStatus: statuses.lint,
      typecheckStatus: statuses.typecheck,
      notes: notes.join("\n\n---\n\n"),
    },
  });

  const hasFailedCheck = Object.values(statuses).includes("FAILED");
  const finalStatus = executionAlreadyFailed || hasFailedCheck ? "FAILED" : "VERIFIED";

  await prisma.run.update({
    where: { id: runId },
    data: { status: finalStatus },
    include: {
      verification: true,
      task: {
        include: {
          plan: true,
          repo: { include: { repoMemory: true } },
        },
      },
    },
  });

  await prisma.task.update({
    where: { id: run.taskId },
    data: { status: finalStatus === "VERIFIED" ? "COMPLETED" : "FAILED" },
  });

  const scoredRun = await computeConfidenceForRun(runId);

  return { run: scoredRun, verification };
}
