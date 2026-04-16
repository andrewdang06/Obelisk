"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";

export function RepoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") || ""),
        localPath: String(formData.get("localPath") || ""),
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error || "Unable to add repository.");
      return;
    }

    router.push(`/repos/${payload.repo.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <FormField
        label="Repository name"
        description="Optional. If blank, the folder name is used."
      >
        <input
          name="name"
          className="h-12 rounded-md border border-white/10 bg-black/30 px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-signal-500/60"
          placeholder="Design System Rewrite"
        />
      </FormField>
      <FormField
        label="Local path"
        description="Use an absolute path to a repository on this machine."
      >
        <input
          name="localPath"
          required
          className="h-12 rounded-md border border-white/10 bg-black/30 px-4 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-signal-500/60"
          placeholder="C:\Users\you\Projects\repo"
        />
      </FormField>
      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Validating path..." : "Add repository"}
      </Button>
    </form>
  );
}
