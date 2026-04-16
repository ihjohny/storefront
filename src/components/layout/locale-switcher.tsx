"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

type LocaleSwitcherProps = {
  locale: string;
  /** Distinct ids when multiple switchers exist (header, footer, mobile). */
  dataTestId?: string;
};

const SUPPORTED_LOCALES = ["en", "bn"] as const;

export function LocaleSwitcher({
  locale,
  dataTestId = "locale-switcher",
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = useMemo(
    () => (SUPPORTED_LOCALES.includes(locale as "en" | "bn") ? locale : "en"),
    [locale],
  );

  function onLocaleChange(nextLocale: string) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }

    if (SUPPORTED_LOCALES.includes(segments[0] as "en" | "bn")) {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    router.push(`/${segments.join("/")}`);
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
      <span>Locale</span>
      <select
        data-testid={dataTestId}
        value={currentLocale}
        onChange={(event) => onLocaleChange(event.target.value)}
        className="max-w-36 rounded-md border border-border bg-card py-1 pl-2 pr-6 text-xs font-medium uppercase text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
        aria-label="Switch locale"
      >
        <option value="en">EN</option>
        <option value="bn">BN</option>
      </select>
    </label>
  );
}
