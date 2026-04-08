import { apiClient } from "./client";
import type { Order, CheckoutRequest, CheckoutResponse } from "../types/order";
import type { PaginatedResponse } from "../types/api-response";

export async function processCheckout(
  data: CheckoutRequest,
  guestId?: string,
): Promise<CheckoutResponse> {
  return apiClient<CheckoutResponse>("/checkout/process", {
    method: "POST",
    body: JSON.stringify(data),
    guestId,
  });
}

export async function getOrders(
  userId: string,
  page = 1,
): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  params.set("where[customer][equals]", userId);
  params.set("sort", "-placedAt");
  params.set("depth", "2");
  params.set("limit", "10");
  params.set("page", String(page));

  return apiClient<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
}

export async function getOrderById(
  orderId: string,
  options?: RequestInit,
): Promise<Order> {
  return apiClient<Order>(`/orders/${orderId}?depth=2`, options);
}

export async function lookupGuestOrder(
  orderNumber: string,
  guestEmail: string,
): Promise<Order> {
  return apiClient<Order>("/guest/order-lookup", {
    method: "POST",
    body: JSON.stringify({ orderNumber, guestEmail }),
  });
}
