export const i18nConfig = {
  locales: ["en", "bn"] as const,
  defaultLocale: "en" as const,
};

export type Locale = (typeof i18nConfig.locales)[number];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * First-segment locale in URLs (`/[locale]/...`). Add new locales only in `i18nConfig.locales`.
 */
export const appLocalePathPrefixPattern = new RegExp(
  `^\\/(${i18nConfig.locales.map(escapeRegExp).join("|")})(?=\\/|$)`,
);

/** Use configured locales only; unknown values fall back to `defaultLocale`. */
export function coerceAppLocale(locale: string): Locale {
  if ((i18nConfig.locales as readonly string[]).includes(locale)) {
    return locale as Locale;
  }
  return i18nConfig.defaultLocale;
}
