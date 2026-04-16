import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function createQueuedRun(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { repo: true },
  });

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  return prisma.run.create({
    data: {
      taskId,
      status: "QUEUED",
      codexCommand: "Pending Codex CLI execution",
    },
    include: {
      task: {
        include: {
          repo: true,
          plan: true,
        },
      },
      verification: true,
    },
  });
}

export async function getRunOrThrow(id: string) {
  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      verification: true,
      task: {
        include: {
          plan: true,
          repo: {
            include: {
              repoMemory: true,
            },
          },
        },
      },
    },
  });

  if (!run) {
    throw new ApiError("Run not found.", 404);
  }

  return run;
}

export async function listRuns() {
  return prisma.run.findMany({
    orderBy: [{ startedAt: "desc" }, { finishedAt: "desc" }],
    include: {
      verification: true,
      task: {
        include: { repo: true, plan: true },
      },
    },
  });
}
