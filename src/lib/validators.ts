import { z } from "zod";

export const createRepoSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  localPath: z.string().trim().min(1).max(1000),
});

export const createTaskSchema = z.object({
  repoId: z.string().cuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(12000),
});

export const updateRepoMemorySchema = z.object({
  architectureSummary: z.string().max(20000).default(""),
  codingConventions: z.string().max(20000).default(""),
  importantModules: z.array(z.string().trim().min(1)).default([]),
  riskyFiles: z.array(z.string().trim().min(1)).default([]),
  failedAttempts: z.array(z.string().trim().min(1)).default([]),
  successfulStrategies: z.array(z.string().trim().min(1)).default([]),
});

export type CreateRepoInput = z.infer<typeof createRepoSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateRepoMemoryInput = z.infer<typeof updateRepoMemorySchema>;
