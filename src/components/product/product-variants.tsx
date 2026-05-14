"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/types/product";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import type { SaleDisplayMode } from "@/lib/utils/sale-presentation";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import { PriceDisplay } from "@/components/shared/price-display";
import { SaleBadge } from "@/components/product/sale-badge";
import { WarehouseAwareAddToCartButton } from "@/components/product/warehouse-aware-add-to-cart-button";
import { ProductCompareButton } from "@/components/product/product-compare-button";
import {
  initialVariantOptionMap,
  resolveVariantOptionMapAfterChange,
  variantToOptionMap,
  type VariantOptionMap,
} from "@/lib/utils/variant-selection";
import { useSyncProductVariantSearchParam } from "@/lib/hooks/use-sync-product-variant-search-param";

type ProductVariantsProps = {
  productId: string;
  variants: ProductVariant[];
  currency: string;
  basePrice: number;
  /** Product-level compare-at when there are no variants in the list (fallback) */
  productCompareAtPrice?: number | null;
  productSaleDisplayMode?: SaleDisplayMode | null;
  showQuantityStepper?: boolean;
  /** `embedded` drops bordered card chrome for Quick View / tight layouts. */
  presentation?: "card" | "embedded";
  /** When set, renders the title block above price/picks; SKU tracks the selected variant when present. */
  product?: Pick<Product, "name" | "shortDescription" | "sku">;
  initialVariantId?: string;
  /** When true (default), keep `?variant=` in sync for shareable URLs. Disable in Quick View. */
  syncVariantSearchParam?: boolean;
  /** Shown when `NEXT_PUBLIC_WAREHOUSE_AVAILABILITY_UI` and allocation fails for the SKU */
  outOfStockLabel?: string;
  checkingAvailabilityLabel?: string;
  availabilityCheckFailedLabel?: string;
  compareLabels?: ProductCompareLabels | null;
};

function wrapClass(presentation: "card" | "embedded") {
  return presentation === "embedded"
    ? "space-y-4"
    : "space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm";
}

export function ProductVariants({
  productId,
  variants,
  currency,
  basePrice,
  productCompareAtPrice = null,
  productSaleDisplayMode,
  showQuantityStepper = false,
  presentation = "card",
  product,
  initialVariantId,
  syncVariantSearchParam = true,
  outOfStockLabel = "Out of Stock",
  checkingAvailabilityLabel = "Checking availability…",
  availabilityCheckFailedLabel = "Couldn't verify stock availability. Try again.",
  compareLabels = null,
}: ProductVariantsProps) {
  const optionNames = useMemo(
    () =>
      Array.from(new Set(variants.flatMap((variant) => variant.options.map((opt) => opt.name)))),
    [variants],
  );

  const initialSelection = useMemo(
    () => initialVariantOptionMap({ variants, initialVariantId }),
    [variants, initialVariantId],
  );

  const [selectedOptions, setSelectedOptions] =
    useState<VariantOptionMap>(initialSelection);

  useEffect(() => {
    setSelectedOptions(initialSelection);
  }, [initialSelection]);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => variantToOptionMap(variant)[name] === selectedOptions[name]),
      ) ?? variants[0],
    [optionNames, selectedOptions, variants],
  );

  useSyncProductVariantSearchParam({
    selectedVariantId: selectedVariant?.id,
    enabled: syncVariantSearchParam && variants.length > 0,
  });

  const price = selectedVariant?.price ?? basePrice;
  const compareAt = selectedVariant?.compareAtPrice ?? productCompareAtPrice ?? null;

  const salePresentation = useMemo(
    () =>
      resolveSalePresentation({
        sellingPrice: price,
        compareAtPrice: compareAt,
        productSaleDisplayMode,
        variantSaleDisplayMode: selectedVariant?.saleDisplayMode,
      }),
    [price, compareAt, productSaleDisplayMode, selectedVariant?.saleDisplayMode],
  );

  const skuOverride = selectedVariant?.sku?.trim() || undefined;

  const headingBlock =
    product != null ? (
      <ProductDetailHeading product={product} skuOverride={skuOverride} />
    ) : null;

  if (variants.length === 0) {
    return (
      <div className={presentation === "embedded" ? "space-y-3 pt-1" : wrapClass(presentation)}>
        {headingBlock}
        <p className="text-sm font-medium text-muted-foreground">No variants available.</p>
        <div className="flex flex-wrap items-center gap-3">
          <PriceDisplay
            price={basePrice}
            compareAtPrice={productCompareAtPrice}
            currency={currency}
            size="large"
            productSaleDisplayMode={productSaleDisplayMode}
          />
          <SaleBadge presentation={salePresentation} currency={currency} size="prominent" />
        </div>
        <div className="flex flex-wrap items-end gap-2 pt-1">
          <div className="min-w-0 flex-1 [&>*]:w-full">
            <WarehouseAwareAddToCartButton
              productId={productId}
              quantity={1}
              showQuantityStepper={showQuantityStepper}
              outOfStockLabel={outOfStockLabel}
              checkingAvailabilityLabel={checkingAvailabilityLabel}
              availabilityCheckFailedLabel={availabilityCheckFailedLabel}
            />
          </div>
          {compareLabels ? (
            <ProductCompareButton productId={productId} variantId={null} labels={compareLabels} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapClass(presentation)}>
      {headingBlock}
      <div className="flex flex-wrap items-center gap-3">
        <PriceDisplay
          price={price}
          compareAtPrice={compareAt}
          currency={currency}
          size="large"
          productSaleDisplayMode={productSaleDisplayMode}
          variantSaleDisplayMode={selectedVariant?.saleDisplayMode}
        />
        <SaleBadge presentation={salePresentation} currency={currency} size="prominent" />
      </div>
      {optionNames.map((name) => {
        const values = Array.from(
          new Set(
            variants
              .map((variant) => variantToOptionMap(variant)[name])
              .filter((value): value is string => Boolean(value)),
          ),
        );
        return (
          <label key={name} className="block space-y-1">
            <span className="text-sm font-medium text-foreground">{name}</span>
            <select
              value={selectedOptions[name] ?? values[0] ?? ""}
              onChange={(event) =>
                setSelectedOptions(
                  resolveVariantOptionMapAfterChange({
                    variants,
                    optionNames,
                    selectedOptions,
                    changedName: name,
                    changedValue: event.target.value,
                  }),
                )
              }
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
            >
              {values.map((value) => (
                <option key={`${name}-${value}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      <div className="flex flex-wrap items-end gap-2 pt-1">
        <div className="min-w-0 flex-1 [&>*]:w-full">
          <WarehouseAwareAddToCartButton
            productId={productId}
            variantId={selectedVariant?.id}
            quantity={1}
            showQuantityStepper={showQuantityStepper}
            outOfStockLabel={outOfStockLabel}
            checkingAvailabilityLabel={checkingAvailabilityLabel}
            availabilityCheckFailedLabel={availabilityCheckFailedLabel}
          />
        </div>
        {compareLabels ? (
          <ProductCompareButton
            productId={productId}
            variantId={selectedVariant?.id ?? null}
            labels={compareLabels}
          />
        ) : null}
      </div>
    </div>
  );
}
