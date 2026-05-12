import { apiClient, ApiError } from "./client";

export type VariantAvailabilityLine = {
  variantId: string | null;
  purchasable: boolean;
};

export type VariantAvailabilityResponse = {
  inventoryEnabled: boolean;
  productId: string;
  storeLocationId: string | null;
  lines: VariantAvailabilityLine[];
};

/**
 * PDP warehouse probe. When the backend disables the route (`404`) or it is missing, returns the same
 * shape as **`inventoryEnabled: false`** so catalog-first deploys are not blocked (see Phase 12 matrix).
 */
export async function getVariantAvailability(params: {
  productId: string;
  storeLocationId?: string | null;
}): Promise<VariantAvailabilityResponse> {
  const qs = new URLSearchParams();
  qs.set("product", params.productId);
  const storeLocationId = params.storeLocationId ?? null;
  if (storeLocationId) {
    qs.set("store", storeLocationId);
  }
  try {
    return await apiClient<VariantAvailabilityResponse>(
      `/storefront/variant-availability?${qs.toString()}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return {
        inventoryEnabled: false,
        productId: params.productId,
        storeLocationId,
        lines: [],
      };
    }
    throw e;
  }
}