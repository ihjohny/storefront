"use client";

import type { Product } from "@/lib/types/product";

type ProductDetailHeadingProps = {
  product: Pick<Product, "name" | "shortDescription" | "sku">;
  /** When set (non-empty after trim), shown instead of `product.sku` for PDP variant picks. */
  skuOverride?: string | null;
};

export function ProductDetailHeading({ product, skuOverride }: ProductDetailHeadingProps) {
  const variantSku = skuOverride?.trim();
  const productSku = product.sku?.trim();
  const displaySku = variantSku || productSku;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {product.name}
      </h1>
      {product.shortDescription ? (
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
          {product.shortDescription}
        </p>
      ) : null}
      {displaySku ? (
        <p className="text-xs font-medium tabular-nums tracking-wide text-muted-foreground">
          SKU · {displaySku}
        </p>
      ) : null}
    </div>
  );
}
