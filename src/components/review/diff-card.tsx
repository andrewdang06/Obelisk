import { Panel, PanelHeader } from "@/components/ui/panel";

type ChangedFile = {
  status?: string;
  path?: string;
};

export function DiffCard({
  changedFiles,
  diffStat,
}: {
  changedFiles: ChangedFile[];
  diffStat?: string;
}) {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Diff"
        title="Changed files"
        description="Captured from git after Codex execution."
      />
      <div className="grid gap-5 p-5">
        {changedFiles.length === 0 ? (
          <p className="text-sm text-zinc-500">No changed files detected.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-white/10">
            {changedFiles.map((file) => (
              <div
                key={`${file.status}-${file.path}`}
                className="grid grid-cols-[72px_1fr] gap-3 border-b border-white/10 px-4 py-3 last:border-b-0"
              >
                <span className="font-mono text-xs text-signal-500">
                  {file.status || "M"}
                </span>
                <span className="break-all font-mono text-xs text-zinc-300">
                  {file.path}
                </span>
              </div>
            ))}
          </div>
        )}
        <pre className="max-h-80 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300">
          {diffStat || "No diff stat captured."}
        </pre>
      </div>
    </Panel>
  );
}
