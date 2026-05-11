"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/types/product";
import type { SaleDisplayMode } from "@/lib/utils/sale-presentation";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import { PriceDisplay } from "@/components/shared/price-display";
import { SaleBadge } from "@/components/product/sale-badge";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import {
  resolveVariantOptionMapAfterChange,
  variantToOptionMap,
  type VariantOptionMap,
} from "@/lib/utils/variant-selection";

type ProductVariantsProps = {
  productId: string;
  variants: ProductVariant[];
  currency: string;
  basePrice: number;
  /** Product-level compare-at when there are no variants in the list (fallback) */
  productCompareAtPrice?: number | null;
  productSaleDisplayMode?: SaleDisplayMode | null;
  showQuantityStepper?: boolean;
};

export function ProductVariants({
  productId,
  variants,
  currency,
  basePrice,
  productCompareAtPrice = null,
  productSaleDisplayMode,
  showQuantityStepper = false,
}: ProductVariantsProps) {
  const optionNames = useMemo(
    () =>
      Array.from(new Set(variants.flatMap((variant) => variant.options.map((opt) => opt.name)))),
    [variants],
  );

  const initialSelection = useMemo(() => {
    const first = variants[0];
    if (!first) {
      return {};
    }
    return variantToOptionMap(first);
  }, [variants]);

  const [selectedOptions, setSelectedOptions] =
    useState<VariantOptionMap>(initialSelection);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => variantToOptionMap(variant)[name] === selectedOptions[name]),
      ) ?? variants[0],
    [optionNames, selectedOptions, variants],
  );

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

  if (variants.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
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
        <AddToCartButton productId={productId} quantity={1} showQuantityStepper={showQuantityStepper} />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
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
      <AddToCartButton
        productId={productId}
        variantId={selectedVariant?.id}
        quantity={1}
        showQuantityStepper={showQuantityStepper}
      />
    </div>
  );
}
