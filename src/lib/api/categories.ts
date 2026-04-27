import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/api-response";
import type { Category } from "../types/category";

export async function getCategories(locale: string): Promise<Category[]> {
  const params = new URLSearchParams();
  params.set("where[isActive][equals]", "true");
  params.set("locale", locale);
  params.set("depth", "1");
  params.set("sort", "displayOrder");
  params.set("limit", "100");

  const response = await apiClient<PaginatedResponse<Category>>(
    `/categories?${params.toString()}`,
    { next: { revalidate: 60 } } as RequestInit,
  );

  return response.docs;
}

export async function getTopLevelCategories(locale: string): Promise<Category[]> {
  const categories = await getCategories(locale);
  return categories.filter((category) => !category.parent).slice(0, 20);
}

export async function getCategoryBySlug(
  slug: string,
  locale: string,
): Promise<Category | null> {
  const categories = await getCategories(locale);
  return (
    categories.find((category) => category.slug.toLowerCase() === slug.toLowerCase()) ??
    null
  );
}
