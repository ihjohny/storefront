import { apiClient } from "./client";
import type { Cart } from "../types/cart";
import type { PaginatedResponse } from "../types/api-response";

type CartMutationItem = {
  product: string;
  variant?: string;
  quantity: number;
};

type CartDocumentResponse = {
  doc: Cart;
};

export async function getCart(userId?: string, guestId?: string): Promise<Cart | null> {
  const params = new URLSearchParams();
  params.set("depth", "2");
  params.set("limit", "1");

  if (userId) {
    params.set("where[user][equals]", userId);
  } else if (guestId) {
    params.set("where[guestId][equals]", guestId);
  } else {
    return null;
  }

  const response = await apiClient<PaginatedResponse<Cart>>(`/carts?${params.toString()}`, {
    guestId: guestId || undefined,
  });

  return response.docs[0] ?? null;
}

export async function createCart(
  items: CartMutationItem[],
  guestId?: string,
): Promise<Cart> {
  const response = await apiClient<CartDocumentResponse>("/carts", {
    method: "POST",
    body: JSON.stringify({ items }),
    guestId,
  });

  return response.doc;
}

export async function updateCart(
  cartId: string,
  items: CartMutationItem[],
  guestId?: string,
): Promise<Cart> {
  const response = await apiClient<CartDocumentResponse>(`/carts/${cartId}`, {
    method: "PATCH",
    body: JSON.stringify({ items }),
    guestId,
  });

  return response.doc;
}

export async function deleteCart(cartId: string, guestId?: string): Promise<void> {
  await apiClient(`/carts/${cartId}`, {
    method: "DELETE",
    guestId,
  });
}

export async function applyCoupon(
  cartId: string,
  couponCode: string,
  guestId?: string,
): Promise<Cart> {
  const response = await apiClient<CartDocumentResponse>(`/carts/${cartId}`, {
    method: "PATCH",
    body: JSON.stringify({ couponCode }),
    guestId,
  });

  return response.doc;
}
