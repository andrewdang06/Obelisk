import { spawn } from "node:child_process";
import { readAgentsGuidance } from "@/lib/agents";
import { ApiError } from "@/lib/api";
import { asStringArray } from "@/lib/format";
import { getGitSummary } from "@/lib/git";
import { generatePlanForTask } from "@/lib/planner";
import { prisma } from "@/lib/prisma";
import { runVerificationForRun } from "@/lib/verification";

const DEFAULT_CODEX_COMMAND = "codex";
const DEFAULT_CODEX_ARGS = "exec";

function parseArgs(value: string | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatList(title: string, values: string[]) {
  if (values.length === 0) {
    return `${title}\n- None recorded`;
  }

  return `${title}\n${values.map((value) => `- ${value}`).join("\n")}`;
}

function buildPrompt({
  taskTitle,
  taskDescription,
  plan,
  memory,
  agentsContent,
}: {
  taskTitle: string;
  taskDescription: string;
  plan: {
    summary: string;
    steps: unknown;
    likelyFiles: unknown;
    risks: unknown;
    verificationSteps: unknown;
    rollbackNotes: string;
  };
  memory: {
    architectureSummary: string;
    codingConventions: string;
    importantModules: unknown;
    riskyFiles: unknown;
    failedAttempts: unknown;
    successfulStrategies: unknown;
  } | null;
  agentsContent: string;
}) {
  return `You are operating inside a local repository through Obelisk.

TASK
Title: ${taskTitle}
Description:
${taskDescription}

SAVED PLAN
Summary:
${plan.summary}

${formatList("Implementation steps:", asStringArray(plan.steps))}

${formatList("Likely files:", asStringArray(plan.likelyFiles))}

${formatList("Risks:", asStringArray(plan.risks))}

${formatList("Verification steps:", asStringArray(plan.verificationSteps))}

Rollback notes:
${plan.rollbackNotes}

REPO MEMORY
Architecture:
${memory?.architectureSummary || "No architecture summary recorded."}

Coding conventions:
${memory?.codingConventions || "No coding conventions recorded."}

${formatList("Important modules:", asStringArray(memory?.importantModules))}

${formatList("Risky files:", asStringArray(memory?.riskyFiles))}

${formatList("Previous failed attempts:", asStringArray(memory?.failedAttempts))}

${formatList("Successful strategies:", asStringArray(memory?.successfulStrategies))}

TARGET REPOSITORY AGENTS.MD
${agentsContent || "No AGENTS.md found in the target repository."}

EXECUTION RULES
- Follow the saved plan unless repository inspection proves it needs adjustment.
- Keep changes scoped and reviewable.
- Do not claim verification passed unless commands actually ran.
- If blocked, leave a clear explanation in the final output.
`;
}

async function collectProcessOutput({
  command,
  args,
  cwd,
}: {
  command: string;
  args: string[];
  cwd: string;
}) {
  return new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    signal: NodeJS.Signals | null;
  }>((resolve) => {
    let stdout = "";
    let stderr = "";

    const child = spawn(command, args, {
      cwd,
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

    child.on("close", (exitCode, signal) => {
      resolve({ stdout, stderr, exitCode, signal });
    });
  });
}

export async function executeTaskWithCodex(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      repo: { include: { repoMemory: true } },
      plan: true,
    },
  });

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  const plan = task.plan ?? (await generatePlanForTask(taskId));
  const agents = await readAgentsGuidance(task.repo.localPath);
  const prompt = buildPrompt({
    taskTitle: task.title,
    taskDescription: task.description,
    plan,
    memory: task.repo.repoMemory,
    agentsContent: agents.content,
  });

  const command = process.env.CODEX_CLI_COMMAND || DEFAULT_CODEX_COMMAND;
  const configuredArgs = parseArgs(
    process.env.CODEX_CLI_ARGS || DEFAULT_CODEX_ARGS,
  );
  const args = [...configuredArgs, prompt];
  const commandForRecord = [command, ...configuredArgs, "<structured-prompt>"].join(
    " ",
  );
  const before = await getGitSummary(task.repo.localPath);

  const run = await prisma.run.create({
    data: {
      taskId,
      status: "RUNNING",
      codexCommand: commandForRecord,
      startedAt: new Date(),
      diffSummary: { before },
    },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "RUNNING" },
  });

  const result = await collectProcessOutput({
    command,
    args,
    cwd: task.repo.localPath,
  });
  const after = await getGitSummary(task.repo.localPath);
  const succeeded = result.exitCode === 0;

  const updatedRun = await prisma.run.update({
    where: { id: run.id },
    data: {
      status: succeeded ? "SUCCEEDED" : "FAILED",
      stdout: result.stdout,
      stderr:
        result.stderr ||
        (result.signal ? `Process terminated with signal ${result.signal}` : ""),
      finishedAt: new Date(),
      diffSummary: {
        before,
        after,
        exitCode: result.exitCode,
        signal: result.signal,
      },
    },
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
    where: { id: taskId },
    data: { status: succeeded ? "COMPLETED" : "FAILED" },
  });

  const verified = await runVerificationForRun(updatedRun.id);
  return verified.run;
}
