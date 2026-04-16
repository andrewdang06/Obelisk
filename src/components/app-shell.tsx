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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_35%_-10%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(3,5,7,0.15)_0%,#030507_78%)]" />
      <div className="pointer-events-none fixed left-0 right-0 top-0 h-px overflow-hidden bg-white/10">
        <div className="signal-scan h-px w-1/3 bg-signal-500/70" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-sm border border-signal-500/50 bg-signal-500 shadow-signal transition group-hover:scale-110" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-200 sm:text-sm">
              Codex Reliability Layer
            </span>
          </Link>
          <nav className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md border border-transparent px-3 py-2 text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-100"
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
