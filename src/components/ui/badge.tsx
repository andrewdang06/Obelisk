import { clsx } from "clsx";
import type { StatusTone } from "@/lib/status";

const toneClass: Record<StatusTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-zinc-300",
  running: "border-signal-500/30 bg-signal-500/10 text-signal-500",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  danger: "border-red-400/30 bg-red-400/10 text-red-300",
  warning: "border-ember-500/30 bg-ember-500/10 text-amber-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
