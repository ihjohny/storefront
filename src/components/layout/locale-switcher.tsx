"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type LocaleSwitcherProps = {
  locale: string;
  /** Distinct ids when multiple switchers exist (header, mobile). */
  dataTestId?: string;
  className?: string;
};

const SUPPORTED_LOCALES = ["en", "bn"] as const;

export function LocaleSwitcher({
  locale,
  dataTestId = "locale-switcher",
  className,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = useMemo(
    () => (SUPPORTED_LOCALES.includes(locale as "en" | "bn") ? locale : "en"),
    [locale],
  );

  function onLocaleChange(nextLocale: string) {
    if (nextLocale === currentLocale) return;
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
    <div
      data-testid={dataTestId}
      role="group"
      aria-label="Language selection"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 p-0.5 shadow-2xs backdrop-blur-xs",
        className,
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center text-muted-foreground ml-0.5" aria-hidden="true">
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </span>
      <div className="inline-flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onLocaleChange("en")}
          aria-label="Switch to English"
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-150",
            currentLocale === "en"
              ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onLocaleChange("bn")}
          aria-label="বাংলা ভাষায় পরিবর্তন করুন"
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-150",
            currentLocale === "bn"
              ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          বাং
        </button>
      </div>
    </div>
  );
}
