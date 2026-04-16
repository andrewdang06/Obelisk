import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { CreateTaskInput } from "@/lib/validators";

export async function createTask(input: CreateTaskInput) {
  const repo = await prisma.repo.findUnique({ where: { id: input.repoId } });
  if (!repo) {
    throw new ApiError("Repository not found.", 404);
  }

  return prisma.task.create({
    data: {
      repoId: input.repoId,
      title: input.title,
      description: input.description,
      status: "DRAFT",
    },
    include: {
      repo: true,
      plan: true,
      runs: true,
    },
  });
}

export async function listTasks() {
  return prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      repo: true,
      plan: true,
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { verification: true },
      },
    },
  });
}

export async function getTaskOrThrow(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      repo: { include: { repoMemory: true } },
      plan: true,
      runs: {
        orderBy: { startedAt: "desc" },
        include: { verification: true },
      },
    },
  });

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  return task;
}
