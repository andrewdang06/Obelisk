import { clsx } from "clsx";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-white/10 bg-white/[0.035] shadow-panel",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-white/10 px-5 py-4">
      {eyebrow ? (
        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-signal-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}
