import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { i18nConfig, type Locale } from "@/lib/i18n/config";

function storefrontOrigin(): string {
  return siteConfig.storefrontUrl.replace(/\/$/, "");
}

/**
 * Canonical + locale alternates for a path under `[locale]/…`.
 * @param pathWithinSite Path after locale, e.g. `/products`, `/products/foo`, `/categories/bar`, `/store/vendor`.
 * Use `""` for the locale home page (`/{locale}`).
 */
export function buildLocaleAlternates(
  locale: Locale,
  pathWithinSite: string,
): NonNullable<Metadata["alternates"]> {
  const origin = storefrontOrigin();
  const suffix =
    pathWithinSite === "" || pathWithinSite === "/"
      ? ""
      : pathWithinSite.startsWith("/")
        ? pathWithinSite
        : `/${pathWithinSite}`;

  const canonical = `${origin}/${locale}${suffix}`;
  const languages = Object.fromEntries(
    i18nConfig.locales.map((loc) => [loc, `${origin}/${loc}${suffix}`]),
  );

  return { canonical, languages };
}
