import { clsx } from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "border-signal-500/50 bg-signal-500 text-ink-950 shadow-signal hover:bg-signal-600",
  secondary:
    "border-white/10 bg-white/[0.04] text-zinc-100 hover:border-white/20 hover:bg-white/[0.08]",
  danger:
    "border-red-400/40 bg-red-400/10 text-red-200 hover:bg-red-400/15",
};

type ButtonVariant = keyof typeof variants;

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
}) {
  return (
    <Link
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
