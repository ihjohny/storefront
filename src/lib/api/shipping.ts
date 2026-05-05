import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";

/** Matches Payload `shipping-methods` collection (see backend `shipping-methods`). */
export type ShippingMethodType = "flat" | "per-item" | "weight-based";

export interface ShippingMethod {
  id: string;
  name: string;
  zone: string | Record<string, unknown>;
  type: ShippingMethodType;
  rate: number;
  currency: string;
  minOrderValue?: number | null;
  maxOrderValue?: number | null;
  /** When true, checkout may use cash-on-delivery; validated server-side (not inferred from name). */
  collectPaymentOnDelivery?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await apiClient<PaginatedResponse<ShippingMethod>>(
    "/shipping-methods?where[isActive][equals]=true&depth=0&limit=50",
    { next: { revalidate: 300 } } as RequestInit,
  );

  return response.docs;
}
