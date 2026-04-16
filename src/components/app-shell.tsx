import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/repos/new", label: "Add Repo" },
  { href: "/tasks/new", label: "New Task" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(3,5,7,0)_0%,#030507_75%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="group flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-sm bg-signal-500 shadow-signal transition group-hover:scale-110" />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-200">
              Codex Reliability Layer
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
