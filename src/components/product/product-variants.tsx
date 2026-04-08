"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/format-price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

type ProductVariantsProps = {
  productId: string;
  variants: ProductVariant[];
  currency: string;
  basePrice: number;
};

type VariantOptionMap = Record<string, string>;

function toOptionMap(variant: ProductVariant): VariantOptionMap {
  return variant.options.reduce<VariantOptionMap>((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {});
}

export function ProductVariants({
  productId,
  variants,
  currency,
  basePrice,
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
    return toOptionMap(first);
  }, [variants]);

  const [selectedOptions, setSelectedOptions] =
    useState<VariantOptionMap>(initialSelection);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => toOptionMap(variant)[name] === selectedOptions[name]),
      ) ?? variants[0],
    [optionNames, selectedOptions, variants],
  );

  const price = selectedVariant?.price ?? basePrice;

  if (variants.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          No variants available.
        </p>
        <p className="text-lg font-semibold">{formatPrice(basePrice, currency)}</p>
        <AddToCartButton productId={productId} quantity={1} />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-lg font-semibold">{formatPrice(price, currency)}</p>
      {optionNames.map((name) => {
        const values = Array.from(
          new Set(
            variants
              .map((variant) => toOptionMap(variant)[name])
              .filter((value): value is string => Boolean(value)),
          ),
        );
        return (
          <label key={name} className="block space-y-1">
            <span className="text-sm font-medium">{name}</span>
            <select
              value={selectedOptions[name] ?? values[0] ?? ""}
              onChange={(event) =>
                setSelectedOptions((prev) => ({ ...prev, [name]: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
      <AddToCartButton productId={productId} variantId={selectedVariant?.id} quantity={1} />
    </div>
  );
}
