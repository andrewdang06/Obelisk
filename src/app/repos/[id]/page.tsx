import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { RunButton } from "@/components/forms/run-button";
import { asStringArray, formatDateTime } from "@/lib/format";
import { getRepoOrThrow } from "@/lib/repositories";
import { formatStatus, runStatusTone, taskStatusTone } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = await getRepoOrThrow(id);
  const riskyFiles = asStringArray(repo.repoMemory?.riskyFiles);

  return (
    <div className="grid gap-7">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
            Workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
            {repo.name}
          </h1>
          <p className="mt-3 break-all font-mono text-sm text-zinc-500">
            {repo.localPath}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/tasks/new?repoId=${repo.id}`}>New task</ButtonLink>
          <ButtonLink href={`/repos/${repo.id}/memory`} variant="secondary">
            Edit memory
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <PanelHeader
            eyebrow="Memory"
            title="Repository context"
            description="Used to shape planning and execution prompts."
          />
          <div className="grid gap-5 p-5 text-sm leading-6 text-zinc-400">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Architecture
              </p>
              <p>
                {repo.repoMemory?.architectureSummary ||
                  "No architecture summary recorded yet."}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Risky files
              </p>
              {riskyFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {riskyFiles.map((file) => (
                    <Badge key={file} tone="warning">
                      {file}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No risky files marked.</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Tasks"
            title="Planned work"
            description="Each task should gain a plan before Codex execution."
          />
          <div className="divide-y divide-white/10">
            {repo.tasks.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-500">
                No tasks have been submitted for this repository.
              </p>
            ) : (
              repo.tasks.map((task) => (
                <article key={task.id} className="grid gap-4 px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-zinc-100">
                        {task.title}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Created {formatDateTime(task.createdAt)}
                      </p>
                    </div>
                    <Badge tone={taskStatusTone[task.status]}>
                      {formatStatus(task.status)}
                    </Badge>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-zinc-400">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <RunButton taskId={task.id} disabled={!task.plan} />
                    {!task.plan ? (
                      <span className="text-xs text-amber-200">
                        Planner milestone will generate this before execution.
                      </span>
                    ) : null}
                  </div>
                  {task.runs.length > 0 ? (
                    <div className="grid gap-2">
                      {task.runs.map((run) => (
                        <Link
                          key={run.id}
                          href={`/runs/${run.id}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2 text-sm transition hover:bg-white/[0.035]"
                        >
                          <span className="text-zinc-300">
                            {formatDateTime(run.startedAt || run.finishedAt)}
                          </span>
                          <Badge tone={runStatusTone[run.status]}>
                            {formatStatus(run.status)}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
