/**
 * PDP deep-link from cart, emails, etc.
 * `?variant=` uses Payload variant document id (same id sent when adding to cart).
 */
export function buildProductDetailHref(
  locale: string,
  productSlug: string,
  variantId?: string | null,
): string {
  const base = `/${locale}/products/${encodeURIComponent(productSlug)}`;
  const trimmed = variantId != null ? String(variantId).trim() : "";
  if (trimmed.length === 0) {
    return base;
  }
  const q = new URLSearchParams({ variant: trimmed });
  return `${base}?${q.toString()}`;
}

/** Payload `order-items.product` at REST depth≥2 vs id-only string. */
export type OrderItemProductRel = string | { id?: string; slug?: string | null } | null | undefined;

/** Payload `order-items.variant` at REST depth≥2 vs id-only string. */
export type OrderItemVariantRel = string | { id?: string } | null | undefined;

export function orderItemProductSlug(product: OrderItemProductRel): string | null {
  if (product == null || typeof product === "string") return null;
  const slug = product.slug;
  if (typeof slug === "string") {
    const t = slug.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

export function orderItemVariantDocumentId(variant: OrderItemVariantRel): string | null {
  if (variant == null) return null;
  if (typeof variant === "string") {
    const t = variant.trim();
    return t.length > 0 ? t : null;
  }
  const id = variant.id;
  if (typeof id === "string") {
    const t = id.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

function snapshotProductSlug(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

/**
 * Slug for order-line PDP links: **`productSlug`** checkout snapshot wins over populated **`product.slug`**
 * so renamed products keep working from order history.
 */
export function orderLineProductSlug(item: {
  product?: OrderItemProductRel;
  productSlug?: string | null;
}): string | null {
  const snap = snapshotProductSlug(item.productSlug);
  if (snap) return snap;
  return orderItemProductSlug(item.product);
}

/** PDP href when slug known from snapshot or populated product; omits `?variant=` if unknown. */
export function orderItemProductDetailHref(
  locale: string,
  item: {
    product?: OrderItemProductRel;
    variant?: OrderItemVariantRel;
    productSlug?: string | null;
  },
): string | null {
  const slug = orderLineProductSlug(item);
  if (!slug) return null;
  const variantId = orderItemVariantDocumentId(item.variant);
  return buildProductDetailHref(locale, slug, variantId ?? undefined);
}

export function parseProductVariantSearchParam(
  query: Record<string, string | string[] | undefined>,
): string | undefined {
  const raw = query.variant;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") {
    return undefined;
  }
  const s = v.trim();
  return s.length > 0 ? s : undefined;
}

/**
 * Same pathname and non-`variant` query keys as `search`; sets or removes `variant`.
 * `search` must follow `window.location.search`: `""` or `?key=value`.
 */
export function pathnameSearchReplacingVariant(
  pathname: string,
  search: string,
  variantDocumentId: string,
): string {
  const suffix = search === "" || search.startsWith("?") ? search : `?${search}`;
  const url = new URL(`https://placeholder.invalid${pathname}${suffix}`);
  const id = variantDocumentId.trim();
  if (id) {
    url.searchParams.set("variant", id);
  } else {
    url.searchParams.delete("variant");
  }
  const q = url.searchParams.toString();
  return q.length > 0 ? `${pathname}?${q}` : pathname;
}
