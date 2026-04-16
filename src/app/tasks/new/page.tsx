import { EmptyState } from "@/components/dashboard/empty-state";
import { TaskForm } from "@/components/forms/task-form";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { listRepos } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const repos = await listRepos();

  if (repos.length === 0) {
    return (
      <EmptyState
        title="Add a repository before creating a task"
        description="Tasks must be tied to a local repository so the planner and Codex execution layer have real context."
        actionHref="/repos/new"
        actionLabel="Add repository"
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
          Task intake
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
          Submit work for a planned Codex run.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          The next stage turns this request into a structured plan before any
          command is allowed to run.
        </p>
      </div>
      <Panel>
        <PanelHeader
          title="Task details"
          description="Keep scope concrete. The generated plan will be saved with the task."
        />
        <div className="p-5">
          <TaskForm repos={repos} />
        </div>
      </Panel>
    </div>
  );
}
