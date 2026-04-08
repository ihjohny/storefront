export const i18nConfig = {
  locales: ["en", "bn"] as const,
  defaultLocale: "en" as const,
};

export type Locale = (typeof i18nConfig.locales)[number];
