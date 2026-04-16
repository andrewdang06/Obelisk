"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReviewActions({ runId }: { runId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"verify" | "score" | null>(null);

  async function post(action: "verify" | "score") {
    setError(null);
    setBusyAction(action);
    const response = await fetch(`/api/runs/${runId}/${action}`, {
      method: "POST",
    });
    const payload = await response.json();
    setBusyAction(null);

    if (!response.ok) {
      setError(payload.error || `Unable to ${action} run.`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={busyAction !== null}
          onClick={() => post("verify")}
        >
          {busyAction === "verify" ? "Running verification..." : "Run verification"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busyAction !== null}
          onClick={() => post("score")}
        >
          {busyAction === "score" ? "Scoring..." : "Recompute confidence"}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
