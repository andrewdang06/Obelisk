import type { CheckStatus, Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { asStringArray } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type ChangedFile = {
  status?: string;
  path?: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusDelta(status: CheckStatus) {
  switch (status) {
    case "PASSED":
      return 14;
    case "FAILED":
      return -22;
    case "SKIPPED":
      return -5;
    case "NOT_RUN":
      return -10;
    default:
      return 0;
  }
}

function getAfterSummary(diffSummary: Prisma.JsonValue | null | undefined) {
  if (!diffSummary || typeof diffSummary !== "object" || Array.isArray(diffSummary)) {
    return null;
  }

  return diffSummary as {
    after?: {
      changedFiles?: ChangedFile[];
      diffFiles?: string[];
      diffStat?: string;
    };
    exitCode?: number | null;
    signal?: string | null;
  };
}

function fileMatchesHint(file: string, hint: string) {
  const normalizedFile = file.replaceAll("\\", "/").toLowerCase();
  const normalizedHint = hint.replaceAll("\\", "/").toLowerCase();

  if (normalizedHint.includes("files to be discovered")) {
    return true;
  }

  return (
    normalizedFile === normalizedHint ||
    normalizedFile.startsWith(`${normalizedHint}/`) ||
    normalizedFile.includes(normalizedHint)
  );
}

export async function computeConfidenceForRun(runId: string) {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: {
      verification: true,
      task: {
        include: {
          plan: true,
          repo: {
            include: { repoMemory: true },
          },
        },
      },
    },
  });

  if (!run) {
    throw new ApiError("Run not found.", 404);
  }

  let score = 50;
  const factors: string[] = [];

  if (run.status === "VERIFIED") {
    score += 10;
    factors.push("Run reached verified status.");
  } else if (run.status === "FAILED") {
    score -= 25;
    factors.push("Run ended in failed status.");
  }

  if (run.stderr.trim().length === 0) {
    score += 5;
    factors.push("No stderr output captured.");
  } else {
    score -= 8;
    factors.push("stderr output was captured.");
  }

  const summary = getAfterSummary(run.diffSummary);
  if (summary?.exitCode === 0) {
    score += 8;
    factors.push("Codex command exited with code 0.");
  } else {
    score -= 18;
    factors.push("Codex command did not exit cleanly.");
  }

  if (run.verification) {
    score += statusDelta(run.verification.testStatus);
    score += statusDelta(run.verification.lintStatus);
    score += statusDelta(run.verification.typecheckStatus);
    factors.push(
      `Verification: test ${run.verification.testStatus}, lint ${run.verification.lintStatus}, typecheck ${run.verification.typecheckStatus}.`,
    );
  } else {
    score -= 20;
    factors.push("No verification result recorded.");
  }

  const changedFiles =
    summary?.after?.changedFiles
      ?.map((file) => file.path)
      .filter((file): file is string => Boolean(file)) ||
    summary?.after?.diffFiles ||
    [];

  if (changedFiles.length === 0) {
    score -= 8;
    factors.push("No changed files were detected.");
  } else if (changedFiles.length <= 5) {
    score += 8;
    factors.push("Diff size is small.");
  } else if (changedFiles.length <= 15) {
    score += 2;
    factors.push("Diff size is moderate.");
  } else {
    score -= 15;
    factors.push("Diff touches many files.");
  }

  const likelyFiles = asStringArray(run.task.plan?.likelyFiles);
  if (likelyFiles.length > 0 && changedFiles.length > 0) {
    const matched = changedFiles.filter((file) =>
      likelyFiles.some((hint) => fileMatchesHint(file, hint)),
    );
    const ratio = matched.length / changedFiles.length;

    if (ratio >= 0.75) {
      score += 10;
      factors.push("Changed files mostly match the saved plan.");
    } else if (ratio >= 0.4) {
      score += 2;
      factors.push("Changed files partially match the saved plan.");
    } else {
      score -= 12;
      factors.push("Changed files diverge from the saved plan.");
    }
  }

  const riskyFiles = asStringArray(run.task.repo.repoMemory?.riskyFiles);
  const touchedRiskyFiles = changedFiles.filter((file) =>
    riskyFiles.some((risky) => fileMatchesHint(file, risky)),
  );

  if (touchedRiskyFiles.length > 0) {
    score -= 15;
    factors.push(`Risky files changed: ${touchedRiskyFiles.join(", ")}.`);
  }

  const confidenceScore = clampScore(score);
  const currentSummary =
    run.diffSummary && typeof run.diffSummary === "object" && !Array.isArray(run.diffSummary)
      ? run.diffSummary
      : {};

  return prisma.run.update({
    where: { id: runId },
    data: {
      confidenceScore,
      diffSummary: {
        ...currentSummary,
        confidence: {
          score: confidenceScore,
          factors,
        },
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
}
