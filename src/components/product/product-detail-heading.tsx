"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Product } from "@/lib/types/product";
import type { Attribute } from "@/lib/types/attribute";
import { getProductBrand } from "@/lib/utils/product-attributes";

type ProductDetailHeadingProps = {
  product: Pick<Product, "name" | "shortDescription" | "sku"> & {
    attributes?: Array<Attribute | string> | null;
  };
  locale?: string;
  /** When set (non-empty after trim), shown instead of `product.sku` for PDP variant picks. */
  skuOverride?: string | null;
};

export function ProductDetailHeading({ product, locale: localeProp, skuOverride }: ProductDetailHeadingProps) {
  const params = useParams();
  const locale = localeProp || (params?.locale as string) || "en";
  const variantSku = skuOverride?.trim();
  const productSku = product.sku?.trim();
  const displaySku = variantSku || productSku;
  const brand = getProductBrand(product);

  return (
    <div className="space-y-2">
      {brand ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/brands/${brand.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            <span>{brand.label}</span>
          </Link>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-semibold text-primary">
            Official Brand
          </span>
        </div>
      ) : null}

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
