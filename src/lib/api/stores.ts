import { apiClient } from "./client";
import type { Store } from "../types/store";
import type { PaginatedResponse } from "../types/api-response";

export async function getPublicStores(): Promise<Store[]> {
  const params = new URLSearchParams();
  params.set("where[isPublicStore][equals]", "true");
  params.set("where[isActive][equals]", "true");
  params.set("sort", "name");
  params.set("depth", "0");
  params.set("limit", "100");

  const response = await apiClient<PaginatedResponse<Store>>(
    `/stock-locations?${params.toString()}`,
    { next: { revalidate: 300 } } as RequestInit,
  );

  return response.docs;
}
