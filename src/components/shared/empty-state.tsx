import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center lg:p-4">
      <p className="text-base font-semibold text-foreground lg:text-sm">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground lg:text-[13px]">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 lg:mt-3 lg:px-3 lg:py-1.5 lg:text-[13px]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
