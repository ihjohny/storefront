"use client";

import { lexicalToPlainText } from "@/lib/utils/lexical-plain-text";
import type { Product } from "@/lib/types/product";

type ProductDetailNarrativeProps = {
  product: Product;
};

/**
 * Full product description (from CMS rich text) shown below the buy box so the
 * PDP column beside the gallery is not mostly empty on wide screens.
 */
export function ProductDetailNarrative({ product }: ProductDetailNarrativeProps) {
  const full = lexicalToPlainText(product.description);
  const short = product.shortDescription?.trim() ?? null;

  if (!full) {
    return null;
  }

  if (short && full === short) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Product details
      </h2>
      <div className="mt-3 max-w-prose text-base leading-relaxed text-foreground">
        {full}
      </div>
    </section>
  );
}
