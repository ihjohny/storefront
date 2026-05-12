"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { features } from "@/lib/config/features";
import { PriceDisplay } from "@/components/shared/price-display";
import { SaleBadge } from "@/components/product/sale-badge";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductMedia } from "@/lib/utils/product-media";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import type { Product } from "@/lib/types/product";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import type { QuickViewCopy } from "@/components/product/product-quick-view";
import { ProductQuickView } from "@/components/product/product-quick-view";
import type { ProductGalleryLabels } from "@/components/product/product-gallery";

type ProductCardProps = {
  product: Product;
  locale: string;
  /** Shown when listing is stock-location-filtered and badges are enabled (Q6). */
  availabilityBadgeLabel?: string | null;
  /** When set with gallery + narrative strings and `features.quickViewEnabled`, enables Quick View. */
  quickViewCopy?: QuickViewCopy | null;
  quickViewGalleryLabels?: ProductGalleryLabels | null;
  quickViewProductDetailsTitle?: string | null;
  quickViewProductDetailsSeeLess?: string | null;
};

function ListingQuickViewEyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function getVendor(tenant: Product["tenant"]) {
  if (!tenant || typeof tenant === "string") {
    return null;
  }
  return tenant;
}

export function ProductCard({
  product,
  locale,
  availabilityBadgeLabel = null,
  quickViewCopy = null,
  quickViewGalleryLabels = null,
  quickViewProductDetailsTitle = null,
  quickViewProductDetailsSeeLess = null,
}: ProductCardProps) {
  const [qvOpen, setQvOpen] = useState(false);

  const media = getProductMedia(product.images);
  const firstImage = media[0];
  const imageUrl = getMediaUrl(firstImage?.url);
  const vendor = getVendor(product.tenant);
  const productHref = `/${locale}/products/${product.slug}`;
  const salePresentation = resolveSalePresentation({
    sellingPrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    productSaleDisplayMode: product.saleDisplayMode,
  });

  const quickViewUiReady =
    Boolean(features.quickViewEnabled) &&
    Boolean(quickViewCopy) &&
    Boolean(quickViewGalleryLabels) &&
    Boolean(quickViewProductDetailsTitle) &&
    Boolean(quickViewProductDetailsSeeLess);

  const listingOpensQuickView =
    quickViewUiReady && features.listingProductCardClick === "quickview";

  const listingMediaAriaGoToPdp = quickViewCopy
    ? `${quickViewCopy.viewFullDetails}: ${product.name}`
    : `View product: ${product.name}`;

  return (
    <div className="h-full min-h-0">
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative isolate aspect-4/3 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={firstImage?.alt || product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : null}
        <div className="pointer-events-none absolute left-2 top-2 z-[5] flex flex-col gap-1">
          <SaleBadge presentation={salePresentation} currency={product.currency} />
          {availabilityBadgeLabel ? (
            <span className="rounded bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm dark:bg-emerald-600/90">
              {availabilityBadgeLabel}
            </span>
          ) : null}
        </div>

        {quickViewUiReady && quickViewCopy ? (
          <button
            type="button"
            className="absolute bottom-2 right-2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-md backdrop-blur-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setQvOpen(true);
            }}
            aria-label={`${quickViewCopy.openTrigger}: ${product.name}`}
          >
            <ListingQuickViewEyeIcon className="size-5" />
          </button>
        ) : null}

        {listingOpensQuickView ? (
          <button
            type="button"
            className="absolute inset-0 z-10 rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            onClick={() => setQvOpen(true)}
            aria-label={`${quickViewCopy!.openTrigger}: ${product.name}`}
          />
        ) : (
          <Link
            href={productHref}
            className="absolute inset-0 z-10 rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            aria-label={listingMediaAriaGoToPdp}
          />
        )}
      </div>

      <div className="space-y-3 p-4">
        {features.multivendor && vendor?.slug ? (
          <Link
            href={`/${locale}/store/${vendor.slug}`}
            className="inline-flex text-xs font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:underline"
          >
            by {vendor.name}
          </Link>
        ) : null}

        {listingOpensQuickView ? (
          <button
            type="button"
            className="block w-full rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setQvOpen(true)}
            aria-label={`${quickViewCopy!.openTrigger}: ${product.name}`}
          >
            <h3 className="line-clamp-2 text-sm font-medium text-foreground hover:underline sm:text-base">
              {product.name}
            </h3>
          </button>
        ) : (
          <Link href={productHref} className="block">
            <h3 className="line-clamp-2 text-sm font-medium text-foreground hover:underline sm:text-base">
              {product.name}
            </h3>
          </Link>
        )}

        <PriceDisplay
          price={product.basePrice}
          compareAtPrice={product.compareAtPrice}
          currency={product.currency}
          productSaleDisplayMode={product.saleDisplayMode}
        />

        <AddToCartButton productId={product.id} quantity={1} />
      </div>

      </article>

      {quickViewUiReady &&
      quickViewCopy &&
      quickViewGalleryLabels &&
      quickViewProductDetailsTitle &&
      quickViewProductDetailsSeeLess ? (
        <ProductQuickView
          open={qvOpen}
          onOpenChange={setQvOpen}
          product={product}
          locale={locale}
          productHref={productHref}
          labels={quickViewCopy}
          galleryLabels={quickViewGalleryLabels}
          productDetailsTitle={quickViewProductDetailsTitle}
          productDetailsSeeLess={quickViewProductDetailsSeeLess}
        />
      ) : null}
    </div>
  );
}
