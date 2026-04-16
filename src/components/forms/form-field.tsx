import type { ReactNode } from "react";

export function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      {children}
      {description ? (
        <span className="text-xs leading-5 text-zinc-500">{description}</span>
      ) : null}
    </label>
  );
}
