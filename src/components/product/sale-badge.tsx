import { formatPrice } from "@/lib/utils/format-price";
import type { SalePresentation } from "@/lib/utils/sale-presentation";

type SaleBadgeProps = {
  presentation: SalePresentation;
  currency?: string;
  className?: string;
  /** Larger, higher-contrast badge for product detail and hero images */
  size?: "default" | "prominent";
};

export function SaleBadge({
  presentation,
  currency = "USD",
  className = "",
  size = "default",
}: SaleBadgeProps) {
  if (!presentation.isOnSale) {
    return null;
  }

  const sizeClass =
    size === "prominent"
      ? "px-3 py-1 text-sm font-bold tracking-tight shadow-lg ring-2 ring-white/50"
      : "px-2 py-0.5 text-xs font-semibold shadow-md ring-1 ring-white/40";

  const base = `inline-flex max-w-full items-center rounded-full bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white ${sizeClass}`;

  if (presentation.showBadgePercent && presentation.savingsPercent != null) {
    return (
      <span
        className={`${base} ${className}`.trim()}
        aria-label={`${presentation.savingsPercent} percent off`}
      >
        −{presentation.savingsPercent}%
      </span>
    );
  }

  if (presentation.showBadgeAmount && presentation.savingsAmount != null) {
    return (
      <span
        className={`${base} ${className}`.trim()}
        aria-label={`Save ${formatPrice(presentation.savingsAmount, currency)}`}
      >
        Save {formatPrice(presentation.savingsAmount, currency)}
      </span>
    );
  }

  return null;
}
