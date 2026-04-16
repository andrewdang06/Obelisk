import Link from "next/link";
import { ConfidenceCard } from "@/components/review/confidence-card";
import { DiffCard } from "@/components/review/diff-card";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { LogBlock } from "@/components/review/log-block";
import { ReviewActions } from "@/components/review/review-actions";
import { VerificationCard } from "@/components/review/verification-card";
import { readAgentsGuidance } from "@/lib/agents";
import { asStringArray, formatDateTime } from "@/lib/format";
import { getRunOrThrow } from "@/lib/runs";
import { formatStatus, runStatusTone } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRunOrThrow(id);
  const agents = await readAgentsGuidance(run.task.repo.localPath);
  const diffSummary =
    run.diffSummary && typeof run.diffSummary === "object" && !Array.isArray(run.diffSummary)
      ? (run.diffSummary as {
          after?: {
            changedFiles?: { status?: string; path?: string }[];
            diffStat?: string;
          };
          confidence?: {
            factors?: string[];
          };
        })
      : {};
  const changedFiles = diffSummary.after?.changedFiles || [];
  const confidenceFactors = Array.isArray(diffSummary.confidence?.factors)
    ? diffSummary.confidence.factors
    : [];

  return (
    <div className="grid gap-7">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
            Run review
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
            {run.task.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            <Link href={`/repos/${run.task.repo.id}`} className="hover:text-zinc-200">
              {run.task.repo.name}
            </Link>
          </p>
        </div>
        <div className="grid justify-start gap-3 lg:justify-end">
          <Badge tone={runStatusTone[run.status]} className="w-fit">
            {formatStatus(run.status)}
          </Badge>
          <ReviewActions runId={run.id} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-sm text-zinc-500">Started</p>
          <p className="mt-3 text-sm font-medium text-zinc-100">
            {formatDateTime(run.startedAt)}
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-zinc-500">Finished</p>
          <p className="mt-3 text-sm font-medium text-zinc-100">
            {formatDateTime(run.finishedAt)}
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-zinc-500">Confidence</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-100">
            {run.confidenceScore ?? "--"}
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-zinc-500">Changed files</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-100">
            {changedFiles.length}
          </p>
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Panel>
          <PanelHeader
            eyebrow="Task"
            title="Original request"
            description="The work item submitted before planning and execution."
          />
          <p className="p-5 text-sm leading-7 text-zinc-300">
            {run.task.description}
          </p>
        </Panel>
        <ConfidenceCard
          score={run.confidenceScore}
          factors={confidenceFactors}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Plan"
            title="Saved execution plan"
            description="Generated before the Codex run started."
          />
          <div className="grid gap-5 p-5">
            <p className="text-sm leading-7 text-zinc-300">
              {run.task.plan?.summary || "No plan recorded."}
            </p>
            {[
              ["Steps", asStringArray(run.task.plan?.steps)],
              ["Likely files", asStringArray(run.task.plan?.likelyFiles)],
              ["Risks", asStringArray(run.task.plan?.risks)],
              [
                "Verification",
                asStringArray(run.task.plan?.verificationSteps),
              ],
            ].map(([title, values]) => (
              <div key={title as string}>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {title as string}
                </p>
                <ul className="grid gap-2 text-sm leading-6 text-zinc-400">
                  {(values as string[]).map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Context"
            title="Memory and AGENTS.md"
            description="Guidance loaded for planning and execution."
          />
          <div className="grid gap-5 p-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Architecture
              </p>
              <p className="text-sm leading-6 text-zinc-400">
                {run.task.repo.repoMemory?.architectureSummary ||
                  "No architecture summary recorded."}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Coding conventions
              </p>
              <p className="text-sm leading-6 text-zinc-400">
                {run.task.repo.repoMemory?.codingConventions ||
                  "No coding conventions recorded."}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                AGENTS.md
              </p>
              <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300">
                {agents.exists ? agents.content : agents.summary}
              </pre>
            </div>
          </div>
        </Panel>
      </section>

      <VerificationCard verification={run.verification} />

      <DiffCard
        changedFiles={changedFiles}
        diffStat={diffSummary.after?.diffStat}
      />

      <Panel>
        <PanelHeader
          eyebrow="Command"
          title="Codex command"
          description="This will become the exact Codex CLI invocation once the execution layer is wired."
        />
        <pre className="overflow-auto p-5 font-mono text-xs leading-6 text-zinc-300">
          {run.codexCommand}
        </pre>
      </Panel>

      <section className="grid gap-5 lg:grid-cols-2">
        <LogBlock title="stdout" value={run.stdout} />
        <LogBlock title="stderr" value={run.stderr} />
      </section>
    </div>
  );
}
