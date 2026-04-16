"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunButton({ taskId, disabled }: { taskId: string; disabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startRun() {
    setError(null);
    setIsSubmitting(true);
    const response = await fetch(`/api/tasks/${taskId}/runs`, {
      method: "POST",
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error || "Unable to start run.");
      return;
    }

    router.push(`/runs/${payload.run.id}`);
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={startRun}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? "Preparing run..." : "Run with Codex"}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
