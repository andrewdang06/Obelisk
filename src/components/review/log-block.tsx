export function LogBlock({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-xs leading-6 text-zinc-300">
        {value?.trim() || "No output captured."}
      </pre>
    </div>
  );
}
