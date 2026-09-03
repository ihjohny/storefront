"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types/product";
import { getProductMedia } from "@/lib/utils/product-media";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductBrand } from "@/lib/utils/product-attributes";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  brand?: string | null;
  brandSlug?: string | null;
  viewedAt: number;
}

const STORAGE_KEY = "bs_recently_viewed";
const MAX_ITEMS = 12;

export function RecentlyViewedTracker({ product }: { product: Product }) {
  useEffect(() => {
    if (!product || !product.id) return;

    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existing: RecentlyViewedItem[] = existingRaw ? JSON.parse(existingRaw) : [];

      const media = getProductMedia(product.images);
      const imageUrl = media[0]?.url ? getMediaUrl(media[0].url) : null;
      const brand = getProductBrand(product);

      const newItem: RecentlyViewedItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.basePrice,
        currency: product.currency,
        imageUrl,
        brand: brand?.label ?? null,
        brandSlug: brand?.slug ?? null,
        viewedAt: Date.now(),
      };

      // Remove current if already present, then prepend
      const filtered = existing.filter((item) => item.id !== product.id);
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors in private browsing
    }
  }, [product]);

  return null;
}
