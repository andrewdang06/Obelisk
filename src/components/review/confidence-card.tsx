import { Panel, PanelHeader } from "@/components/ui/panel";

export function ConfidenceCard({
  score,
  factors,
}: {
  score: number | null;
  factors: string[];
}) {
  const value = score ?? 0;
  const tone =
    score === null
      ? "bg-zinc-600"
      : value >= 80
        ? "bg-emerald-400"
        : value >= 55
          ? "bg-amber-300"
          : "bg-red-400";

  return (
    <Panel>
      <PanelHeader
        eyebrow="Confidence"
        title={score === null ? "Not scored" : `${score}/100`}
        description="Computed from verification, execution cleanliness, plan adherence, diff size, and risky files."
      />
      <div className="grid gap-5 p-5">
        <div className="h-2 overflow-hidden rounded-sm bg-white/10">
          <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
        </div>
        <div className="grid gap-2">
          {factors.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Confidence factors will appear after scoring.
            </p>
          ) : (
            factors.map((factor) => (
              <p key={factor} className="text-sm leading-6 text-zinc-400">
                {factor}
              </p>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
