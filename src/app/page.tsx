import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDateTime } from "@/lib/format";
import { formatStatus, runStatusTone, taskStatusTone } from "@/lib/status";
import { listRepos } from "@/lib/repositories";
import { listRuns } from "@/lib/runs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [repos, runs] = await Promise.all([listRepos(), listRuns()]);
  const latestRuns = runs.slice(0, 5);
  const taskCount = repos.reduce((sum, repo) => sum + repo._count.tasks, 0);
  const verifiedRuns = runs.filter((run) => run.status === "VERIFIED").length;

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
            Reliability console
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.03] text-zinc-50 md:text-6xl">
            Put evidence between a coding task and the merge.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Register repositories, submit work, require a plan, execute Codex
            CLI, verify the result, and review the confidence trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <ButtonLink href="/tasks/new">New task</ButtonLink>
          <ButtonLink href="/repos/new" variant="secondary">
            Add repository
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Repositories
          </p>
          <p className="mt-3 text-4xl font-semibold text-zinc-100">
            {repos.length}
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Tasks
          </p>
          <p className="mt-3 text-4xl font-semibold text-zinc-100">
            {taskCount}
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Verified runs
          </p>
          <p className="mt-3 text-4xl font-semibold text-zinc-100">
            {verifiedRuns}
          </p>
        </Panel>
      </section>

      {repos.length === 0 ? (
        <EmptyState
          title="No repositories registered"
          description="Add a local repository path to begin building a reliability trail for Codex work."
          actionHref="/repos/new"
          actionLabel="Add first repository"
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Panel>
            <PanelHeader
              eyebrow="Repos"
              title="Registered workspaces"
              description="Local repositories available for planned Codex execution."
            />
            <div className="divide-y divide-white/10">
              {repos.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/repos/${repo.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.035]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-zinc-100">{repo.name}</h2>
                    <span className="text-xs text-zinc-500">
                      {repo._count.tasks} tasks
                    </span>
                  </div>
                  <p className="truncate font-mono text-xs text-zinc-500">
                    {repo.localPath}
                  </p>
                  {repo.tasks[0] ? (
                    <div className="flex items-center gap-2">
                      <Badge tone={taskStatusTone[repo.tasks[0].status]}>
                        {formatStatus(repo.tasks[0].status)}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {repo.tasks[0].title}
                      </span>
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="Runs"
              title="Latest execution trail"
              description="Recent Codex runs and verification status."
            />
            <div className="divide-y divide-white/10">
              {latestRuns.length === 0 ? (
                <p className="px-5 py-8 text-sm text-zinc-500">
                  No runs have been started yet.
                </p>
              ) : (
                latestRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/runs/${run.id}`}
                    className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.035]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-zinc-100">
                        {run.task.title}
                      </span>
                      <Badge tone={runStatusTone[run.status]}>
                        {formatStatus(run.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                      <span>{run.task.repo.name}</span>
                      <span>{formatDateTime(run.startedAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}
