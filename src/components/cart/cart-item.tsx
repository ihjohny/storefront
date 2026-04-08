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
  const image = item.variant?.image ?? item.product.images?.[0] ?? null;
  const imageUrl = getMediaUrl(image?.url);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <article className="grid grid-cols-[88px_1fr] gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[112px_1fr] sm:gap-4 sm:p-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt || item.product.name}
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
            <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
              {item.variant.name}
            </p>
          ) : null}
          <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">
            {formatPrice(lineTotal)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-700">
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
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-900 sm:text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
