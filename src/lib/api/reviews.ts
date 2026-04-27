import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";

export interface ProductReview {
  id: string;
  product: string;
  author: { id: string; displayName: string | null; email: string } | string;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function getProductReviews(
  productId: string,
  page = 1,
): Promise<PaginatedResponse<ProductReview>> {
  const params = new URLSearchParams();
  params.set("where[product][equals]", productId);
  params.set("where[status][equals]", "approved");
  params.set("sort", "-createdAt");
  params.set("depth", "1");
  params.set("limit", "10");
  params.set("page", String(page));
  return apiClient<PaginatedResponse<ProductReview>>(`/product-reviews?${params.toString()}`);
}

export async function createProductReview(data: {
  product: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<ProductReview> {
  const response = await apiClient<{ doc: ProductReview }>("/product-reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.doc;
}
