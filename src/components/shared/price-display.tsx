import { formatPrice } from "@/lib/utils/format-price";

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
};

export function PriceDisplay({
  price,
  compareAtPrice = null,
  currency = "USD",
}: PriceDisplayProps) {
  const hasDiscount = typeof compareAtPrice === "number" && compareAtPrice > price;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold sm:text-base">{formatPrice(price, currency)}</span>
      {hasDiscount ? (
        <span className="text-xs text-slate-500 line-through dark:text-slate-400 sm:text-sm">
          {formatPrice(compareAtPrice, currency)}
        </span>
      ) : null}
    </div>
  );
}
