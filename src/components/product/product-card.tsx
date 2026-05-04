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

type ProductCardProps = {
  product: Product;
  locale: string;
  /** Shown when listing is stock-location-filtered and badges are enabled (Q6). */
  availabilityBadgeLabel?: string | null;
};

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
}: ProductCardProps) {
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

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Link href={productHref} className="block">
        <div className="relative aspect-4/3 bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={firstImage?.alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : null}
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1">
            <SaleBadge presentation={salePresentation} currency={product.currency} />
            {availabilityBadgeLabel ? (
              <span className="rounded bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm dark:bg-emerald-600/90">
                {availabilityBadgeLabel}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        {features.multivendor && vendor?.slug ? (
          <Link
            href={`/${locale}/store/${vendor.slug}`}
            className="inline-flex text-xs font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:underline"
          >
            by {vendor.name}
          </Link>
        ) : null}
        <Link href={productHref} className="block">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground hover:underline sm:text-base">
            {product.name}
          </h3>
        </Link>
        <PriceDisplay
          price={product.basePrice}
          compareAtPrice={product.compareAtPrice}
          currency={product.currency}
          productSaleDisplayMode={product.saleDisplayMode}
        />
        <AddToCartButton productId={product.id} quantity={1} />
      </div>
    </article>
  );
}
