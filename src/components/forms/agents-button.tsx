"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AgentsButton({ repoId }: { repoId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createAgentsFile() {
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/repos/${repoId}/agents`, {
      method: "POST",
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error || "Unable to create AGENTS.md.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={createAgentsFile}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating AGENTS.md..." : "Create suggested AGENTS.md"}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
