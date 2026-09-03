import type { PaginatedResponse } from "./api-response";
import type { Category } from "./category";
import type { Attribute } from "./attribute";
import type { SaleDisplayMode, VariantSaleDisplayMode } from "@/lib/utils/sale-presentation";

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
  productType?: "standard" | "bundle";
  description: unknown;
  shortDescription: string | null;
  sku: string | null;
  status: "draft" | "pending-review" | "published" | "archived";
  featured: boolean;
  categories: Category[] | string[];
  attributes?: Array<Attribute | string> | null;
  images: Media[];
  basePrice: number;
  compareAtPrice: number | null;
  /** Admin-controlled sale UI; defaults to strike_through in UI if omitted (legacy API). */
  saleDisplayMode?: SaleDisplayMode;
  costPrice?: number | null;
  currency: string;
  hasVariants: boolean;
  bundleItems?: Array<{
    product: Product | string;
    variant?: ProductVariant | string | null;
    quantity: number;
  }>;
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
  /** Override product sale display; inherit uses product setting. */
  saleDisplayMode?: VariantSaleDisplayMode;
  options: Array<{ name: string; value: string }>;
  image: Media | null;
  isActive: boolean;
  tenant?: string | null;
}

export type ProductsResponse = PaginatedResponse<Product>;
