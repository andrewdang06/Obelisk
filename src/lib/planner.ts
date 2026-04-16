import { promises as fs } from "node:fs";
import path from "node:path";
import { ApiError } from "@/lib/api";
import { asStringArray } from "@/lib/format";
import { prisma } from "@/lib/prisma";

async function readPackageScripts(repoPath: string) {
  try {
    const raw = await fs.readFile(path.join(repoPath, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
    return parsed.scripts || {};
  } catch {
    return {};
  }
}

function inferLikelyFiles(description: string, memoryModules: string[]) {
  const normalized = description.toLowerCase();
  const hints = new Set<string>();

  for (const modulePath of memoryModules) {
    hints.add(modulePath);
  }

  if (normalized.includes("api") || normalized.includes("route")) {
    hints.add("src/app/api");
    hints.add("src/lib");
  }

  if (
    normalized.includes("database") ||
    normalized.includes("schema") ||
    normalized.includes("prisma") ||
    normalized.includes("model")
  ) {
    hints.add("prisma/schema.prisma");
    hints.add("src/lib/prisma.ts");
  }

  if (
    normalized.includes("ui") ||
    normalized.includes("page") ||
    normalized.includes("form") ||
    normalized.includes("dashboard")
  ) {
    hints.add("src/app");
    hints.add("src/components");
  }

  if (
    normalized.includes("test") ||
    normalized.includes("lint") ||
    normalized.includes("type")
  ) {
    hints.add("package.json");
  }

  if (hints.size === 0) {
    hints.add("Files to be discovered during repo inspection");
  }

  return Array.from(hints);
}

function inferRisks(description: string, riskyFiles: string[]) {
  const normalized = description.toLowerCase();
  const risks = new Set<string>();

  if (riskyFiles.length > 0) {
    risks.add(`Repo memory marks ${riskyFiles.length} risky file(s).`);
  }

  if (normalized.includes("database") || normalized.includes("migration")) {
    risks.add("Database changes can break existing data or migrations.");
  }

  if (normalized.includes("auth") || normalized.includes("permission")) {
    risks.add("Auth and permission changes require careful regression checks.");
  }

  if (normalized.includes("execute") || normalized.includes("child_process")) {
    risks.add("Process execution changes can affect local filesystem safety.");
  }

  if (normalized.includes("refactor")) {
    risks.add("Refactors can drift from intended behavior without tests.");
  }

  risks.add("Codex output must be verified before claiming completion.");
  return Array.from(risks);
}

function inferVerificationSteps(scripts: Record<string, string>) {
  const steps: string[] = [];

  if (scripts.test) {
    steps.push("npm run test");
  } else {
    steps.push("Tests: skipped unless a test script exists");
  }

  if (scripts.lint) {
    steps.push("npm run lint");
  } else {
    steps.push("Lint: skipped unless a lint script exists");
  }

  if (scripts.typecheck) {
    steps.push("npm run typecheck");
  } else if (scripts["type-check"]) {
    steps.push("npm run type-check");
  } else {
    steps.push("Typecheck: skipped unless a typecheck script exists");
  }

  return steps;
}

export async function generatePlanForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      repo: {
        include: { repoMemory: true },
      },
    },
  });

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  const memory = task.repo.repoMemory;
  const importantModules = asStringArray(memory?.importantModules);
  const riskyFiles = asStringArray(memory?.riskyFiles);
  const scripts = await readPackageScripts(task.repo.localPath);

  const steps = [
    "Inspect the target repository state and relevant existing patterns.",
    "Apply the smallest implementation that satisfies the task.",
    "Keep changes scoped to the planned files unless inspection proves otherwise.",
    "Capture changed files and summarize the diff.",
    "Run verification and record failures honestly.",
  ];

  const likelyFiles = inferLikelyFiles(task.description, importantModules);
  const risks = inferRisks(task.description, riskyFiles);
  const verificationSteps = inferVerificationSteps(scripts);

  const plan = await prisma.plan.upsert({
    where: { taskId },
    create: {
      taskId,
      summary: `${task.title}: ${task.description.slice(0, 240)}`,
      steps,
      likelyFiles,
      risks,
      verificationSteps,
      rollbackNotes:
        "If verification fails, inspect the captured diff, revert only the run changes, and preserve logs for review.",
    },
    update: {
      summary: `${task.title}: ${task.description.slice(0, 240)}`,
      steps,
      likelyFiles,
      risks,
      verificationSteps,
      rollbackNotes:
        "If verification fails, inspect the captured diff, revert only the run changes, and preserve logs for review.",
    },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "PLANNED" },
  });

  return plan;
}
