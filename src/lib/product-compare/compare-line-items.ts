/**
 * Product comparison list entries (optionally pinned to a SKU).
 *
 * URL query **`items=`**: comma-separated segments; use `~` between product id and variant id when set.
 * Example: `prodA,prodB~varB2` (encode the full value when building query strings).
 * Legacy **`ids=a,b,c`** is still accepted on the compare page (product-only rows).
 */

import { MAX_PRODUCT_COMPARE_ITEMS } from "@/lib/product-compare/constants";

export type CompareLineItem = {
  productId: string;
  variantId: string | null;
};

export function compareLineKey(item: CompareLineItem): string {
  return `${item.productId}:${item.variantId ?? ""}`;
}

export function normalizeCompareLines(raw: CompareLineItem[]): CompareLineItem[] {
  const seen = new Set<string>();
  const out: CompareLineItem[] = [];
  for (const item of raw) {
    const productId = item.productId.trim();
    if (!productId) {
      continue;
    }
    const variantId =
      item.variantId != null && String(item.variantId).trim() !== "" ?
        String(item.variantId).trim()
      : null;
    const line: CompareLineItem = { productId, variantId };
    const key = compareLineKey(line);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(line);
    if (out.length >= MAX_PRODUCT_COMPARE_ITEMS) {
      break;
    }
  }
  return out;
}

export function serializeCompareItemsQuery(entries: CompareLineItem[]): string {
  const normalized = normalizeCompareLines(entries);
  return normalized
    .map((e) => (e.variantId ? `${e.productId}~${e.variantId}` : e.productId))
    .join(",");
}

export function parseCompareItemsToken(param: string | null): CompareLineItem[] {
  if (!param?.trim()) {
    return [];
  }
  const segments = param.split(",");
  const raw: CompareLineItem[] = [];
  for (const segment of segments) {
    const s = segment.trim();
    if (!s) {
      continue;
    }
    const tilde = s.indexOf("~");
    if (tilde === -1) {
      raw.push({ productId: s, variantId: null });
      continue;
    }
    const productId = s.slice(0, tilde).trim();
    const variantId = s.slice(tilde + 1).trim();
    if (!productId) {
      continue;
    }
    raw.push({ productId, variantId: variantId || null });
  }
  return normalizeCompareLines(raw);
}

/** Legacy `ids=a,b,c` → product-only lines. */
export function parseLegacyCompareIdsParam(ids: string | null): CompareLineItem[] {
  if (!ids?.trim()) {
    return [];
  }
  const raw = ids
    .split(",")
    .map((s) => ({ productId: s.trim(), variantId: null as string | null }))
    .filter((x) => Boolean(x.productId));
  return normalizeCompareLines(raw);
}
