import { appLocalePathPrefixPattern, coerceAppLocale } from "@/lib/i18n/config";

/**
 * Turn CMS-stored paths (often authored with a default locale like `/en/...`) into
 * storefront hrefs for the active `[locale]` route. External URLs are unchanged.
 * Supported path locales come from `i18nConfig.locales`.
 */
export function normalizeCmsPathToHref(path: string, locale: string): string {
  const safe = coerceAppLocale(locale);
  const t = path.trim();
  if (!t) return `/${safe}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  if (appLocalePathPrefixPattern.test(t)) {
    return t.replace(appLocalePathPrefixPattern, `/${safe}`);
  }
  if (t.startsWith("/")) {
    return `/${safe}${t}`;
  }
  return `/${safe}/${t}`;
}
