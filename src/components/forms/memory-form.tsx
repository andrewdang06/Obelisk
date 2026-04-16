"use client";

import type { RepoMemory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { asStringArray } from "@/lib/format";

function joinList(value: unknown) {
  return asStringArray(value).join("\n");
}

function splitList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function MemoryForm({
  repoId,
  memory,
}: {
  repoId: string;
  memory: RepoMemory;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/repos/${repoId}/memory`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        architectureSummary: String(formData.get("architectureSummary") || ""),
        codingConventions: String(formData.get("codingConventions") || ""),
        importantModules: splitList(formData.get("importantModules")),
        riskyFiles: splitList(formData.get("riskyFiles")),
        failedAttempts: splitList(formData.get("failedAttempts")),
        successfulStrategies: splitList(formData.get("successfulStrategies")),
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error || "Unable to save memory.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <FormField label="Architecture summary">
        <textarea
          name="architectureSummary"
          rows={5}
          defaultValue={memory.architectureSummary}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      <FormField label="Coding conventions">
        <textarea
          name="codingConventions"
          rows={5}
          defaultValue={memory.codingConventions}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      <FormField label="Important modules" description="One path or note per line.">
        <textarea
          name="importantModules"
          rows={4}
          defaultValue={joinList(memory.importantModules)}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      <FormField label="Risky files" description="One path per line.">
        <textarea
          name="riskyFiles"
          rows={4}
          defaultValue={joinList(memory.riskyFiles)}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      <FormField label="Previous failed attempts" description="One note per line.">
        <textarea
          name="failedAttempts"
          rows={4}
          defaultValue={joinList(memory.failedAttempts)}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      <FormField label="Successful strategies" description="One note per line.">
        <textarea
          name="successfulStrategies"
          rows={4}
          defaultValue={joinList(memory.successfulStrategies)}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-signal-500/60"
        />
      </FormField>
      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Repo memory saved.
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving memory..." : "Save memory"}
      </Button>
    </form>
  );
}
