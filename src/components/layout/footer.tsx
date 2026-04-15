import Link from "next/link";
import { getFooter } from "@/lib/api/globals";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

type FooterProps = {
  locale: string;
};

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const fallbackColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Products", href: "/products" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Cart", href: "/cart" },
      { label: "Track Your Order", href: "/track-order" },
    ],
  },
];

export async function Footer({ locale }: FooterProps) {
  let columns = fallbackColumns;

  try {
    const response = await getFooter(locale);
    const data = response as Record<string, unknown>;
    if (Array.isArray(data.columns)) {
      const parsed = data.columns
        .map((column) => {
          if (!column || typeof column !== "object") {
            return null;
          }
          const record = column as Record<string, unknown>;
          const title = typeof record.title === "string" ? record.title : null;
          const linksRaw = Array.isArray(record.links) ? record.links : [];
          const links = linksRaw
            .map((link) => {
              if (!link || typeof link !== "object") {
                return null;
              }
              const l = link as Record<string, unknown>;
              const label = typeof l.label === "string" ? l.label : null;
              const href = typeof l.href === "string" ? l.href : null;
              if (!label || !href) {
                return null;
              }
              return { label, href };
            })
            .filter((item): item is FooterLink => Boolean(item));

          if (!title || links.length === 0) {
            return null;
          }
          return { title, links };
        })
        .filter((item): item is FooterColumn => Boolean(item));

      if (parsed.length > 0) {
        columns = parsed;
      }
    }
  } catch {
    // Keep footer functional with local fallback links.
  }

  return (
    <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <section key={column.title} className="space-y-3">
              <h2 className="text-sm font-semibold">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      href={
                        link.href.startsWith("/") ? `/${locale}${link.href}` : link.href
                      }
                      className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600 sm:flex-row sm:items-center dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} BS Commerce</p>
          <LocaleSwitcher locale={locale} dataTestId="locale-switcher-footer" />
        </div>
      </div>
    </footer>
  );
}
