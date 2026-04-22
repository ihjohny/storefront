export type SaleDisplayMode =
  | "none"
  | "strike_through"
  | "badge_percent"
  | "badge_amount"
  | "strike_and_badge";

/** Variant-only: use product mode when `inherit` or omitted. */
export type VariantSaleDisplayMode = SaleDisplayMode | "inherit";

export type SalePresentation = {
  effectiveMode: SaleDisplayMode;
  isOnSale: boolean;
  showStrike: boolean;
  showBadgePercent: boolean;
  showBadgeAmount: boolean;
  savingsAmount: number | null;
  savingsPercent: number | null;
};

export function resolveEffectiveSaleMode(
  productMode: SaleDisplayMode | null | undefined,
  variantMode: VariantSaleDisplayMode | null | undefined,
): SaleDisplayMode {
  const product = productMode ?? "strike_through";
  if (variantMode == null || variantMode === "inherit") {
    return product;
  }
  return variantMode;
}

export function resolveSalePresentation(params: {
  sellingPrice: number;
  compareAtPrice: number | null | undefined;
  productSaleDisplayMode?: SaleDisplayMode | null;
  variantSaleDisplayMode?: VariantSaleDisplayMode | null;
}): SalePresentation {
  const { sellingPrice, compareAtPrice, productSaleDisplayMode, variantSaleDisplayMode } = params;
  const compare = typeof compareAtPrice === "number" ? compareAtPrice : null;
  const isOnSale = compare != null && compare > sellingPrice;

  const effectiveMode = resolveEffectiveSaleMode(productSaleDisplayMode, variantSaleDisplayMode);

  if (!isOnSale) {
    return {
      effectiveMode,
      isOnSale: false,
      showStrike: false,
      showBadgePercent: false,
      showBadgeAmount: false,
      savingsAmount: null,
      savingsPercent: null,
    };
  }

  const savingsAmount = compare - sellingPrice;
  const savingsPercent = Math.round((savingsAmount / compare) * 100);

  let showStrike = false;
  let showBadgePercent = false;
  let showBadgeAmount = false;

  switch (effectiveMode) {
    case "none":
      break;
    case "strike_through":
      showStrike = true;
      break;
    case "badge_percent":
      showBadgePercent = true;
      break;
    case "badge_amount":
      showBadgeAmount = true;
      break;
    case "strike_and_badge":
      showStrike = true;
      showBadgePercent = true;
      break;
    default:
      showStrike = true;
  }

  return {
    effectiveMode,
    isOnSale: true,
    showStrike,
    showBadgePercent,
    showBadgeAmount,
    savingsAmount,
    savingsPercent,
  };
}
