import Link from "next/link";
import { getFooter } from "@/lib/api/globals";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import {
  FooterColumns,
  type FooterColumn,
  type FooterLink,
} from "@/components/layout/footer-columns";
import { parseFooterLinkVisibility } from "@/lib/utils/footer-link-visibility";
import { normalizeCmsPathToHref } from "@/lib/utils/normalize-cms-href";

type FooterProps = {
  locale: string;
};

type BottomLink = {
  label: string;
  url: string;
};

const fallbackColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products", visibility: "public" },
      { label: "Categories", href: "/categories", visibility: "public" },
      { label: "Bundles", href: "/bundles", visibility: "public" },
    ],
  },
  {
    title: "Pages & Information",
    links: [
      { label: "About Farm Greens", href: "/about-farm-greens", visibility: "public" },
      { label: "Delivery in Dhaka", href: "/dhaka-delivery", visibility: "public" },
      { label: "Shipping Policy", href: "/shipping-policy", visibility: "public" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Shopping Cart", href: "/cart", visibility: "public" },
      { label: "Track Your Order", href: "/track-order", visibility: "public" },
      { label: "Contact Us", href: "/contact", visibility: "public" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/auth/login", visibility: "guest" },
      { label: "Register", href: "/auth/register", visibility: "guest" },
      { label: "My Account", href: "/account", visibility: "authenticated" },
      { label: "My Orders", href: "/account/orders", visibility: "authenticated" },
      { label: "Wishlist", href: "/account/wishlist", visibility: "authenticated" },
    ],
  },
];

export async function Footer({ locale }: FooterProps) {
  let columns: FooterColumn[] = fallbackColumns;
  let copyrightText: string | null = null;
  let bottomLinks: BottomLink[] = [];

  try {
    const response = await getFooter(locale);
    const data = response as Record<string, unknown> | null;

    if (data) {
      if (typeof data.copyrightText === "string" && data.copyrightText.trim()) {
        copyrightText = data.copyrightText.trim();
      }

      if (Array.isArray(data.bottomLinks)) {
        bottomLinks = data.bottomLinks
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const b = item as Record<string, unknown>;
            const label = typeof b.label === "string" ? b.label : null;
            const url = typeof b.url === "string" ? b.url : null;
            if (!label || !url) return null;
            return { label, url };
          })
          .filter((item): item is BottomLink => item !== null);
      }

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
                if (l.enabled === false) {
                  return null;
                }
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
    }
  } catch {
    // Keep footer functional with fallback links when backend is unreachable.
  }

  return (
    <footer className="border-t border-border bg-card/40 py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
        <FooterColumns locale={locale} columns={columns} />

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>{copyrightText || `© ${new Date().getFullYear()} BS Commerce. All rights reserved.`}</p>

          {bottomLinks.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={`${link.url}-${link.label}`}
                  href={normalizeCmsPathToHref(link.url, locale)}
                  className="transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} dataTestId="locale-switcher-footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
