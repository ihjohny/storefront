"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

type LocaleSwitcherProps = {
  locale: string;
  /** Distinct ids when multiple switchers exist (header, footer, mobile). */
  dataTestId?: string;
};

const SUPPORTED_LOCALES = ["en", "bn"] as const;

export function LocaleSwitcher({ locale, dataTestId = "locale-switcher" }: LocaleSwitcherProps) {
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
    <label className="inline-flex items-center gap-2 text-xs sm:text-sm">
      <span className="text-slate-500 dark:text-slate-400">Locale</span>
      <select
        data-testid={dataTestId}
        value={currentLocale}
        onChange={(event) => onLocaleChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs uppercase shadow-sm outline-none ring-0 transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 sm:text-sm"
        aria-label="Switch locale"
      >
        <option value="en">EN</option>
        <option value="bn">BN</option>
      </select>
    </label>
  );
}
