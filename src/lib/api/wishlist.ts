import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";
import type { Product } from "../types/product";

export interface WishlistItem {
  id: string;
  user: string | null;
  product: Product | string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getWishlistItemsPage(
  userId: string,
  page = 1,
  limit = 12,
): Promise<PaginatedResponse<WishlistItem>> {
  const params = new URLSearchParams();
  params.set("where[user][equals]", userId);
  params.set("depth", "2");
  params.set("sort", "-updatedAt");
  params.set("page", String(page));
  params.set("limit", String(limit));
  return apiClient<PaginatedResponse<WishlistItem>>(`/wishlist-items?${params.toString()}`);
}

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const response = await getWishlistItemsPage(userId, 1, 100);
  return response.docs;
}

export async function findWishlistItemByProduct(
  userId: string,
  productId: string,
): Promise<WishlistItem | null> {
  const params = new URLSearchParams();
  params.set("where[user][equals]", userId);
  params.set("where[product][equals]", productId);
  params.set("limit", "1");
  params.set("depth", "0");
  const response = await apiClient<PaginatedResponse<WishlistItem>>(
    `/wishlist-items?${params.toString()}`,
  );
  return response.docs[0] ?? null;
}

export async function createWishlistItem(userId: string, productId: string): Promise<WishlistItem> {
  const response = await apiClient<{ doc: WishlistItem }>("/wishlist-items", {
    method: "POST",
    body: JSON.stringify({ user: userId, product: productId }),
  });
  return response.doc;
}

export async function deleteWishlistItem(id: string): Promise<void> {
  await apiClient(`/wishlist-items/${id}`, { method: "DELETE" });
}
