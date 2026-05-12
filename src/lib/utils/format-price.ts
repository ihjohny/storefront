import { features } from "@/lib/config/features";

type Currency = "USD" | "BDT" | string;

const currencyConfig: Record<string, { locale: string; decimals: number }> = {
  USD: { locale: "en-US", decimals: 2 },
  BDT: { locale: "bn-BD", decimals: 0 },
};

/** When `currency` is omitted, uses `NEXT_PUBLIC_DEFAULT_CURRENCY` (see `features.currency.default`). */
export function formatPrice(amount: number, currency?: Currency): string {
  const code = currency ?? features.currency.default;
  const config = currencyConfig[code] || { locale: "en-US", decimals: 2 };

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
    ...(config.locale === "bn-BD" ? { numberingSystem: "latn" as const } : {}),
  }).format(amount);
}
