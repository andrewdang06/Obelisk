import type { CheckStatus, VerificationResult } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { checkStatusTone, formatStatus } from "@/lib/status";

export function VerificationCard({
  verification,
}: {
  verification: VerificationResult | null;
}) {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Verification"
        title="Command results"
        description="Missing scripts are marked skipped, not passed."
      />
      <div className="grid gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            ["Tests", verification?.testStatus || "NOT_RUN"],
            ["Lint", verification?.lintStatus || "NOT_RUN"],
            ["Typecheck", verification?.typecheckStatus || "NOT_RUN"],
          ] satisfies [string, CheckStatus][]).map(([label, status]) => (
            <div key={label} className="rounded-md border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {label}
              </p>
              <Badge tone={checkStatusTone[status]} className="mt-3">
                {formatStatus(status)}
              </Badge>
            </div>
          ))}
        </div>
        <pre className="max-h-80 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs leading-6 text-zinc-300">
          {verification?.notes || "Verification has not run yet."}
        </pre>
      </div>
    </Panel>
  );
}
