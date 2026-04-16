"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem as CartItemType } from "@/lib/types/cart";
import { formatPrice } from "@/lib/utils/format-price";
import { getMediaUrl } from "@/lib/utils/url";

type CartItemProps = {
  locale: string;
  item: CartItemType;
  isLoading?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItem({
  locale,
  item,
  isLoading = false,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const rawProductImage = item.product.images?.[0] ?? null;
  const image =
    item.variant?.image ??
    (rawProductImage && typeof rawProductImage === "object" && "image" in rawProductImage
      ? rawProductImage.image
      : rawProductImage);
  const rawMediaUrl =
    image && typeof image === "object" && "url" in image && typeof (image as { url: unknown }).url === "string"
      ? (image as { url: string }).url
      : null;
  const imageUrl = getMediaUrl(rawMediaUrl);
  const imageAlt =
    image && typeof image === "object" && "alt" in image && typeof (image as { alt: unknown }).alt === "string"
      ? (image as { alt: string }).alt
      : item.product.name;
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <article className="grid grid-cols-[88px_1fr] gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[112px_1fr] sm:gap-4 sm:p-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 88px, 112px"
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Link
            href={`/${locale}/products/${item.product.slug}`}
            className="line-clamp-2 text-sm font-semibold hover:underline sm:text-base"
          >
            {item.product.name}
          </Link>
          {item.variant ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {item.variant.name}
            </p>
          ) : null}
          <p className="text-sm text-foreground sm:text-base">
            {formatPrice(lineTotal)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border bg-background">
            <button
              type="button"
              onClick={onDecrease}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-10 px-2 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50 sm:text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
