import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  rate: number;
  estimatedDays: string | null;
  isActive: boolean;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await apiClient<PaginatedResponse<ShippingMethod>>(
    "/shipping-methods?where[isActive][equals]=true&depth=0&limit=50",
    { next: { revalidate: 300 } } as RequestInit,
  );

  return response.docs;
}
