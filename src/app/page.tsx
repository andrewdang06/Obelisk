export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.28em] text-signal-500">
          Codex Reliability Layer
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight">
          Structured planning, execution, verification, and review for Codex
          CLI.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-400">
          The application shell is ready. The next milestones wire in data,
          orchestration, and the review workflow.
        </p>
      </div>
    </main>
  );
}
