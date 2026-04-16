import type { CheckStatus, RunStatus, TaskStatus } from "@prisma/client";

export type StatusTone = "neutral" | "running" | "success" | "danger" | "warning";

export const taskStatusTone: Record<TaskStatus, StatusTone> = {
  DRAFT: "neutral",
  PLANNED: "warning",
  RUNNING: "running",
  COMPLETED: "success",
  FAILED: "danger",
};

export const runStatusTone: Record<RunStatus, StatusTone> = {
  QUEUED: "neutral",
  RUNNING: "running",
  SUCCEEDED: "success",
  FAILED: "danger",
  VERIFYING: "running",
  VERIFIED: "success",
};

export const checkStatusTone: Record<CheckStatus, StatusTone> = {
  NOT_RUN: "neutral",
  PASSED: "success",
  FAILED: "danger",
  SKIPPED: "warning",
};

export function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
