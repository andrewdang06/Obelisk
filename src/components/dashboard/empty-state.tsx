import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Panel className="px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <ButtonLink href={actionHref} className="mt-6">
        {actionLabel}
      </ButtonLink>
    </Panel>
  );
}
