/**
 * Resolves which stock location id (if any) to pass into catalog listing helpers.
 * When multi-store + geography is enabled and the shopper picked a location,
 * default listings use stock-aware `GET /api/storefront/store-products`.
 * `inStockAtStore=0` opts into the full published catalog for PLP only (Q6).
 */
export function resolveListingStoreId(input: {
  serviceAreaStoreSelection: boolean;
  selectedStockLocationId: string | undefined;
  /** Raw `inStockAtStore` query value; `"0"` means full catalog (ignore location for listing). */
  inStockAtStoreParam: string | undefined;
}): string | undefined {
  if (!input.serviceAreaStoreSelection) {
    return undefined;
  }
  if (input.inStockAtStoreParam === "0") {
    return undefined;
  }
  return input.selectedStockLocationId;
}
