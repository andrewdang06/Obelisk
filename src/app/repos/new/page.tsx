import { RepoForm } from "@/components/forms/repo-form";
import { Panel, PanelHeader } from "@/components/ui/panel";

export default function NewRepoPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
          Repository intake
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
          Add a local repository.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The app stores the path, reads repo guidance, and runs Codex CLI from
          inside that workspace when a task is executed.
        </p>
      </div>
      <Panel>
        <PanelHeader
          title="Repository path"
          description="The server must be able to read this directory."
        />
        <div className="p-5">
          <RepoForm />
        </div>
      </Panel>
    </div>
  );
}
