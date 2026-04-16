import { promises as fs } from "node:fs";
import path from "node:path";
import { ApiError } from "@/lib/api";
import { asStringArray } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const AGENTS_FILE = "AGENTS.md";

export async function readAgentsGuidance(repoPath: string) {
  const agentsPath = path.join(repoPath, AGENTS_FILE);

  try {
    const content = await fs.readFile(agentsPath, "utf8");
    return {
      exists: true,
      path: agentsPath,
      content,
      summary: summarizeAgentsContent(content),
    };
  } catch {
    return {
      exists: false,
      path: agentsPath,
      content: "",
      summary: "No AGENTS.md file found in the target repository.",
    };
  }
}

export function summarizeAgentsContent(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(0, 8).join(" ");
}

export function buildAgentsSuggestion({
  repoName,
  architectureSummary,
  codingConventions,
  riskyFiles,
}: {
  repoName: string;
  architectureSummary?: string;
  codingConventions?: string;
  riskyFiles?: string[];
}) {
  return `# AGENTS.md

## Project Purpose
${repoName} is maintained through Codex Reliability Layer. Keep changes scoped, verified, and easy to review.

## Architecture Notes
${architectureSummary || "Document the core architecture before broad changes."}

## Coding Conventions
${codingConventions || "Follow existing local patterns and keep TypeScript strict where applicable."}

## Risk Controls
${riskyFiles?.length ? riskyFiles.map((file) => `- Treat \`${file}\` as risky and explain any edits.`).join("\n") : "- Call out risky files before editing them."}
- Run available tests, lint, and typecheck before claiming completion.
- Report failed verification clearly.

## Task Checklist
1. Plan before coding.
2. Keep changes small and reviewable.
3. Summarize changed files.
4. Record verification results.
`;
}

export async function writeSuggestedAgentsFile(repoId: string) {
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { repoMemory: true },
  });

  if (!repo) {
    throw new ApiError("Repository not found.", 404);
  }

  const guidance = await readAgentsGuidance(repo.localPath);
  if (guidance.exists) {
    throw new ApiError("Target repository already has AGENTS.md.", 409);
  }

  const content = buildAgentsSuggestion({
    repoName: repo.name,
    architectureSummary: repo.repoMemory?.architectureSummary,
    codingConventions: repo.repoMemory?.codingConventions,
    riskyFiles: asStringArray(repo.repoMemory?.riskyFiles),
  });

  await fs.writeFile(guidance.path, content, "utf8");

  return {
    exists: true,
    path: guidance.path,
    content,
    summary: summarizeAgentsContent(content),
  };
}
