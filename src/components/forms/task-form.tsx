"use client";

import type { Repo } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";

export function TaskForm({ repos }: { repos: Repo[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRepoId = searchParams.get("repoId") || repos[0]?.id || "";
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoId: String(formData.get("repoId") || ""),
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error || "Unable to create task.");
      return;
    }

    router.push(`/repos/${payload.task.repoId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <FormField label="Repository">
        <select
          name="repoId"
          defaultValue={selectedRepoId}
          className="h-12 rounded-md border border-white/10 bg-black/30 px-4 text-sm text-zinc-100 outline-none transition focus:border-signal-500/60"
        >
          {repos.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Task title">
        <input
          name="title"
          required
          className="h-12 rounded-md border border-white/10 bg-black/30 px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-signal-500/60"
          placeholder="Refactor the upload pipeline"
        />
      </FormField>
      <FormField
        label="Task description"
        description="Write the task as you would hand it to a senior engineer."
      >
        <textarea
          name="description"
          required
          rows={8}
          className="resize-y rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-signal-500/60"
          placeholder="Explain the bug, feature, or refactor. Include constraints, acceptance criteria, and anything Codex must not touch."
        />
      </FormField>
      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting || repos.length === 0}>
        {isSubmitting ? "Saving task..." : "Create task and prepare plan"}
      </Button>
    </form>
  );
}
