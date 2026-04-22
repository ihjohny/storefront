import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | undefined>;
};

function buildHref(
  pathname: string,
  query: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function Pagination({
  currentPage,
  totalPages,
  pathname,
  query,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildHref(pathname, query, currentPage - 1)}
          scroll={false}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted"
        >
          Previous
        </Link>
      ) : null}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(pathname, query, page)}
          scroll={false}
          aria-current={currentPage === page ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 text-sm ${
            currentPage === page
              ? "bg-primary font-medium text-primary-foreground"
              : "border border-border bg-background hover:bg-muted"
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(pathname, query, currentPage + 1)}
          scroll={false}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
