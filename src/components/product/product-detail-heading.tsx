"use client";

import type { Product } from "@/lib/types/product";

type ProductDetailHeadingProps = {
  product: Product;
};

export function ProductDetailHeading({ product }: ProductDetailHeadingProps) {
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
      {product.sku ? (
        <p className="text-xs font-medium tabular-nums tracking-wide text-muted-foreground">
          SKU · {product.sku}
        </p>
      ) : null}
    </div>
  );
}
