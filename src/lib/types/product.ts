import type { PaginatedResponse } from "./api-response";
import type { Category } from "./category";

export interface Media {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  filesize: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: unknown;
  shortDescription: string | null;
  sku: string | null;
  status: "draft" | "pending-review" | "published" | "archived";
  featured: boolean;
  categories: Category[] | string[];
  images: Media[];
  basePrice: number;
  compareAtPrice: number | null;
  costPrice?: number | null;
  currency: string;
  hasVariants: boolean;
  tenant: { id: string; name: string; slug: string } | string | null;
  meta: {
    title: string | null;
    description: string | null;
    image: Media | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ProductVariant {
  id: string;
  product: Product | string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  options: Array<{ name: string; value: string }>;
  image: Media | null;
  isActive: boolean;
  tenant?: string | null;
}

export type ProductsResponse = PaginatedResponse<Product>;
