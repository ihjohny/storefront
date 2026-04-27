import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-slate-600 hover:underline dark:text-slate-300"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-900 dark:text-slate-100" : ""}>
                {item.label}
              </span>
            )}
            {!isLast ? <span className="text-slate-400">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
