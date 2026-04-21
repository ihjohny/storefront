import { features } from "@/lib/config/features";
import { getHeader } from "@/lib/api/globals";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { Navbar, type NavItem } from "@/components/layout/navbar";
import { normalizeCmsPathToHref } from "@/lib/utils/normalize-cms-href";

type HeaderProps = {
  locale: string;
};

function getDefaultItems(locale: string, labels: Record<string, string>): NavItem[] {
  // Cart is only in the toolbar + mobile drawer (count badge) — not repeated in primary links.
  return [
    { label: labels.home, href: `/${locale}` },
    { label: labels.products, href: `/${locale}/products` },
    { label: labels.categories, href: `/${locale}/categories` },
  ];
}

/** Avoid duplicating the toolbar Cart control when CMS nav includes /cart. */
function withoutToolbarCartLink(items: NavItem[], locale: string): NavItem[] {
  const cartHref = `/${locale}/cart`;
  return items.filter((item) => item.href !== cartHref);
}

function normalizeNavItems(raw: unknown, locale: string): NavItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): NavItem | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      if (record.enabled === false) {
        return null;
      }

      const label =
        typeof record.label === "string"
          ? record.label
          : typeof record.title === "string"
            ? record.title
            : null;

      const href =
        typeof record.href === "string"
          ? record.href
          : typeof record.url === "string"
            ? record.url
            : null;

      if (!label || !href) {
        return null;
      }

      return {
        label,
        href: normalizeCmsPathToHref(href, locale),
        showInDesktopNav: record.showInDesktopNav !== false,
        showInMobileDrawer: record.showInMobileDrawer !== false,
      };
    })
    .filter((item): item is NavItem => Boolean(item));
}

export async function Header({ locale }: HeaderProps) {
  const safeLocale = (locale === "bn" ? "bn" : "en") as Locale;
  const dictionary = await getDictionary(safeLocale);

  const labels = {
    home: dictionary.common?.home ?? "Home",
    products: dictionary.common?.products ?? "Products",
    categories: dictionary.common?.categories ?? "Categories",
    vendor: dictionary.vendor?.directory ?? "Vendors",
  };

  let navItems = getDefaultItems(locale, labels);
  let announcementText: string | null = null;

  try {
    const response = await getHeader(locale);
    const data = response as Record<string, unknown>;
    const navRaw = data.navLinks ?? data.navItems;
    const fromApi = normalizeNavItems(navRaw, locale);
    const cmsNavHasRows = Array.isArray(navRaw) && navRaw.length > 0;

    if (cmsNavHasRows) {
      navItems = fromApi;
    } else if (fromApi.length > 0) {
      navItems = fromApi;
    }

    const announcement = data.announcementBar as Record<string, unknown> | undefined;
    const enabled = announcement?.enabled === true;
    const text =
      typeof announcement?.message === "string"
        ? announcement.message
        : typeof announcement?.text === "string"
          ? announcement.text
          : undefined;

    if (enabled && text) {
      announcementText = text;
    }
  } catch {
    // Fallback UI keeps layout stable when globals endpoint is unavailable.
  }

  if (features.multivendor && !navItems.some((item) => item.href.includes("/vendors"))) {
    navItems.push({ label: labels.vendor, href: `/${locale}/vendors` });
  }

  navItems = withoutToolbarCartLink(navItems, locale);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
      {announcementText ? (
        <div className="border-b border-border bg-muted px-4 py-2 text-center text-xs text-foreground">
          {announcementText}
        </div>
      ) : null}
      <Navbar locale={locale} navItems={navItems} />
    </header>
  );
}
