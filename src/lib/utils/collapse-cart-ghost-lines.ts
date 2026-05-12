/**
 * Listing cards often add items without `variant` while PDP sends variant ids for the same SKU.
 * Cart identity uses (product, variant); merge ghost rows into the lone variant line when safe.
 */
export type CartLineMutationInput = {
  product: string;
  variant?: string;
  quantity: number;
};

function lineKey(product: string, variantId: string | null) {
  return `${product}::${variantId ?? "no-variant"}`;
}

function mergeLinesByKey(lines: CartLineMutationInput[]): CartLineMutationInput[] {
  const map = new Map<string, CartLineMutationInput>();
  for (const item of lines) {
    const key = lineKey(item.product, item.variant ?? null);
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values()).filter((line) => line.quantity > 0);
}

/**
 * When a product appears once **without** variant (PLP) and once **with** a variant (PDP),
 * combine quantities into the variant row. If multiple variants exist for the same product,
 * ambiguous ghost qty stays as a separate product-only line.
 */
export function collapseGhostVariantCartLines(lines: CartLineMutationInput[]): CartLineMutationInput[] {
  const byProduct = new Map<string, CartLineMutationInput[]>();
  for (const item of lines) {
    const arr = byProduct.get(item.product) ?? [];
    arr.push(item);
    byProduct.set(item.product, arr);
  }

  const out: CartLineMutationInput[] = [];

  for (const [, group] of byProduct) {
    const ghosts = group.filter((line) => !line.variant);
    const variants = group.filter((line) => line.variant);
    const ghostMerged = mergeLinesByKey(ghosts);
    const ghostQty = ghostMerged.reduce((sum, g) => sum + g.quantity, 0);

    if (variants.length === 1 && ghostQty > 0) {
      out.push({
        ...variants[0],
        quantity: variants[0].quantity + ghostQty,
      });
      continue;
    }

    out.push(...ghostMerged, ...variants);
  }

  return mergeLinesByKey(out);
}
