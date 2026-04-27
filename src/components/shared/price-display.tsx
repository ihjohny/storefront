import { formatPrice } from "@/lib/utils/format-price";
import {
  resolveSalePresentation,
  type SaleDisplayMode,
  type VariantSaleDisplayMode,
} from "@/lib/utils/sale-presentation";

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  /** Larger typography for product detail / variant selector */
  size?: "default" | "large";
  productSaleDisplayMode?: SaleDisplayMode | null;
  variantSaleDisplayMode?: VariantSaleDisplayMode | null;
};

export function PriceDisplay({
  price,
  compareAtPrice = null,
  currency = "USD",
  size = "default",
  productSaleDisplayMode,
  variantSaleDisplayMode,
}: PriceDisplayProps) {
  const presentation = resolveSalePresentation({
    sellingPrice: price,
    compareAtPrice,
    productSaleDisplayMode,
    variantSaleDisplayMode,
  });

  const showStrike = presentation.showStrike && presentation.isOnSale;

  const mainClass =
    size === "large"
      ? "text-lg font-semibold text-foreground"
      : "text-sm font-semibold text-foreground sm:text-base";
  const strikeClass =
    size === "large"
      ? "text-sm text-muted-foreground line-through"
      : "text-xs text-muted-foreground line-through sm:text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={mainClass}>{formatPrice(price, currency)}</span>
      {showStrike && typeof compareAtPrice === "number" ? (
        <span className={strikeClass}>{formatPrice(compareAtPrice, currency)}</span>
      ) : null}
    </div>
  );
}
