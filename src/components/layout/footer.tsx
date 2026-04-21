import { getFooter } from "@/lib/api/globals";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import {
  FooterColumns,
  type FooterColumn,
  type FooterLink,
} from "@/components/layout/footer-columns";
import { parseFooterLinkVisibility } from "@/lib/utils/footer-link-visibility";

type FooterProps = {
  locale: string;
};

const fallbackColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Products", href: "/products", visibility: "public" },
      { label: "Categories", href: "/categories", visibility: "public" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Cart", href: "/cart", visibility: "public" },
      { label: "Track Your Order", href: "/track-order", visibility: "public" },
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
          const title =
            typeof record.heading === "string"
              ? record.heading
              : typeof record.title === "string"
                ? record.title
                : null;
          const linksRaw = Array.isArray(record.links) ? record.links : [];
          const links = linksRaw
            .map((link) => {
              if (!link || typeof link !== "object") {
                return null;
              }
              const l = link as Record<string, unknown>;
              const label = typeof l.label === "string" ? l.label : null;
              const href =
                typeof l.url === "string" ? l.url : typeof l.href === "string" ? l.href : null;
              if (!label || !href) {
                return null;
              }
              return {
                label,
                href,
                visibility: parseFooterLinkVisibility(l.visibility),
              };
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
        <FooterColumns locale={locale} columns={columns} />
        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600 sm:flex-row sm:items-center dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} BS Commerce</p>
          <LocaleSwitcher locale={locale} dataTestId="locale-switcher-footer" />
        </div>
      </div>
    </footer>
  );
}
