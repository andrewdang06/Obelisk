import { promises as fs } from "node:fs";
import { ApiError } from "@/lib/api";
import { getRepoNameFromPath, normalizeLocalPath } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import type { CreateRepoInput } from "@/lib/validators";

async function assertDirectory(localPath: string) {
  try {
    const stat = await fs.stat(localPath);
    if (!stat.isDirectory()) {
      throw new ApiError("Repository path must be a directory.", 400);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Repository path does not exist or is not readable.", 400);
  }
}

export async function listRepos() {
  return prisma.repo.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { tasks: true },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          runs: {
            orderBy: { startedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
}

export async function createRepo(input: CreateRepoInput) {
  const localPath = normalizeLocalPath(input.localPath);
  await assertDirectory(localPath);

  return prisma.repo.create({
    data: {
      name: input.name?.trim() || getRepoNameFromPath(localPath),
      localPath,
      repoMemory: {
        create: {
          architectureSummary: "",
          codingConventions: "",
          importantModules: [],
          riskyFiles: [],
          failedAttempts: [],
          successfulStrategies: [],
        },
      },
    },
    include: { repoMemory: true },
  });
}

export async function getRepoOrThrow(id: string) {
  const repo = await prisma.repo.findUnique({
    where: { id },
    include: {
      repoMemory: true,
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          runs: {
            orderBy: { startedAt: "desc" },
            take: 3,
            include: { verification: true },
          },
        },
      },
    },
  });

  if (!repo) {
    throw new ApiError("Repository not found.", 404);
  }

  return repo;
}
