import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";
import type { Product, ProductVariant, ProductsResponse } from "../types/product";
import { ITEMS_PER_PAGE } from "../utils/constants";

type ProductFilters = {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tenant?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  locale?: string;
  storeId?: string;
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductsResponse> {
  if (filters.storeId) {
    return getStoreProducts(filters);
  }

  const params = new URLSearchParams();
  params.set("limit", String(filters.limit ?? ITEMS_PER_PAGE));
  params.set("page", String(filters.page ?? 1));

  if (filters.locale) {
    params.set("locale", filters.locale);
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.category) {
    params.set("where[categories][in]", filters.category);
  }
  if (filters.search) {
    params.set("where[name][like]", filters.search);
  }
  if (typeof filters.minPrice === "number") {
    params.set("where[basePrice][greater_than_equal]", String(filters.minPrice));
  }
  if (typeof filters.maxPrice === "number") {
    params.set("where[basePrice][less_than_equal]", String(filters.maxPrice));
  }
  if (filters.tenant) {
    params.set("where[tenant][equals]", filters.tenant);
  }
  if (filters.featured) {
    params.set("where[featured][equals]", "true");
  }

  return apiClient<ProductsResponse>(`/products?${params.toString()}`, {
    cache: "no-store",
  } as RequestInit);
}

async function getStoreProducts(
  filters: ProductFilters,
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  params.set("store", filters.storeId!);
  params.set("limit", String(filters.limit ?? ITEMS_PER_PAGE));
  params.set("page", String(filters.page ?? 1));

  if (filters.locale) params.set("locale", filters.locale);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (typeof filters.minPrice === "number") params.set("minPrice", String(filters.minPrice));
  if (typeof filters.maxPrice === "number") params.set("maxPrice", String(filters.maxPrice));
  if (filters.tenant) params.set("tenant", filters.tenant);
  if (filters.featured) params.set("featured", "true");

  return apiClient<ProductsResponse>(
    `/storefront/store-products?${params.toString()}`,
    { cache: "no-store" } as RequestInit,
  );
}

export async function getProductBySlug(
  slug: string,
  locale: string,
): Promise<Product | null> {
  const params = new URLSearchParams();
  params.set("where[slug][equals]", slug);
  params.set("locale", locale);
  params.set("depth", "2");
  params.set("limit", "1");

  const response = await apiClient<ProductsResponse>(`/products?${params.toString()}`, {
    next: { revalidate: 60 },
  } as RequestInit);

  return response.docs[0] ?? null;
}

export async function getProductVariants(
  productId: string,
  locale?: string,
): Promise<ProductVariant[]> {
  const params = new URLSearchParams();
  params.set("where[product][equals]", productId);
  params.set("where[isActive][equals]", "true");
  params.set("limit", "100");
  params.set("depth", "2");

  const response = await apiClient<PaginatedResponse<ProductVariant>>(
    `/product-variants?${params.toString()}`,
    {
      ...(locale ? { locale } : {}),
      ...(typeof window === "undefined" ? { next: { revalidate: 30 } } : {}),
    } as RequestInit,
  );

  return response.docs;
}
