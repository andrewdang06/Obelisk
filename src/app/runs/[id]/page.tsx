import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { LogBlock } from "@/components/review/log-block";
import { formatDateTime } from "@/lib/format";
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
        <Badge tone={runStatusTone[run.status]} className="w-fit">
          {formatStatus(run.status)}
        </Badge>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
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
      </section>

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
