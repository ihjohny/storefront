import { apiClient } from "./client";
import type { FacetsResponse } from "../types/facet";

export interface GetFacetsOptions {
  category?: string;
  productClass?: string;
  storeId?: string;
  locale?: string;
}

export async function getFacets(
  options: GetFacetsOptions = {}
): Promise<FacetsResponse> {
  try {
    const params = new URLSearchParams();
    if (options.category) params.set("category", options.category);
    if (options.productClass) params.set("class", options.productClass);
    if (options.storeId) params.set("store", options.storeId);
    if (options.locale) params.set("locale", options.locale);

    const query = params.toString();
    const endpoint = query ? `/storefront/facets?${query}` : "/storefront/facets";

    const response = await apiClient<FacetsResponse>(endpoint, {
      cache: "no-store",
    } as RequestInit);

    return (
      response ?? {
        classes: [],
        facets: [],
      }
    );
  } catch {
    return {
      classes: [],
      facets: [],
    };
  }
}
