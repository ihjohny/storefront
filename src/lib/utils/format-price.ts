type Currency = "USD" | "BDT" | string;

const currencyConfig: Record<string, { locale: string; decimals: number }> = {
  USD: { locale: "en-US", decimals: 2 },
  BDT: { locale: "bn-BD", decimals: 0 },
};

export function formatPrice(amount: number, currency: Currency = "USD"): string {
  const config = currencyConfig[currency] || { locale: "en-US", decimals: 2 };

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}
