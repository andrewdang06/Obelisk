import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { UpdateRepoMemoryInput } from "@/lib/validators";

export async function getRepoMemory(repoId: string) {
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { repoMemory: true },
  });

  if (!repo) {
    throw new ApiError("Repository not found.", 404);
  }

  if (repo.repoMemory) {
    return repo.repoMemory;
  }

  return prisma.repoMemory.create({
    data: {
      repoId,
      architectureSummary: "",
      codingConventions: "",
      importantModules: [],
      riskyFiles: [],
      failedAttempts: [],
      successfulStrategies: [],
    },
  });
}

export async function updateRepoMemory(
  repoId: string,
  input: UpdateRepoMemoryInput,
) {
  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  if (!repo) {
    throw new ApiError("Repository not found.", 404);
  }

  return prisma.repoMemory.upsert({
    where: { repoId },
    create: {
      repoId,
      ...input,
    },
    update: input,
  });
}
