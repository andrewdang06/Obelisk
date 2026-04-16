import { AgentsButton } from "@/components/forms/agents-button";
import { MemoryForm } from "@/components/forms/memory-form";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { buildAgentsSuggestion, readAgentsGuidance } from "@/lib/agents";
import { asStringArray } from "@/lib/format";
import { getRepoMemory } from "@/lib/repo-memory";
import { getRepoOrThrow } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function RepoMemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [repo, memory] = await Promise.all([
    getRepoOrThrow(id),
    getRepoMemory(id),
  ]);
  const agents = await readAgentsGuidance(repo.localPath);
  const suggestion = buildAgentsSuggestion({
    repoName: repo.name,
    architectureSummary: memory.architectureSummary,
    codingConventions: memory.codingConventions,
    riskyFiles: asStringArray(memory.riskyFiles),
  });

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_0.75fr]">
      <section className="grid gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-signal-500">
            Repo memory
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-zinc-50">
            {repo.name}
          </h1>
          <p className="mt-3 break-all font-mono text-sm text-zinc-500">
            {repo.localPath}
          </p>
        </div>
        <Panel>
          <PanelHeader
            title="Memory profile"
            description="This context is loaded into planning and execution prompts."
          />
          <div className="p-5">
            <MemoryForm repoId={repo.id} memory={memory} />
          </div>
        </Panel>
      </section>

      <aside className="grid content-start gap-5">
        <Panel>
          <PanelHeader
            eyebrow="AGENTS.md"
            title={agents.exists ? "Guidance found" : "Guidance missing"}
            description={agents.path}
          />
          <div className="grid gap-4 p-5">
            <p className="text-sm leading-6 text-zinc-400">{agents.summary}</p>
            {agents.exists ? (
              <pre className="max-h-96 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300">
                {agents.content}
              </pre>
            ) : (
              <>
                <AgentsButton repoId={repo.id} />
                <pre className="max-h-96 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300">
                  {suggestion}
                </pre>
              </>
            )}
          </div>
        </Panel>
      </aside>
    </div>
  );
}
