import Image from "next/image";
import Link from "next/link";
import { features } from "@/lib/config/features";
import { formatPrice } from "@/lib/utils/format-price";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductMedia } from "@/lib/utils/product-media";
import type { Product } from "@/lib/types/product";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

type ProductCardProps = {
  product: Product;
  locale: string;
};

function getVendor(tenant: Product["tenant"]) {
  if (!tenant || typeof tenant === "string") {
    return null;
  }
  return tenant;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const media = getProductMedia(product.images);
  const firstImage = media[0];
  const imageUrl = getMediaUrl(firstImage?.url);
  const vendor = getVendor(product.tenant);
  const productHref = `/${locale}/products/${product.slug}`;

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
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {formatPrice(product.basePrice, product.currency)}
          </p>
          {typeof product.compareAtPrice === "number" ? (
            <p className="text-xs text-muted-foreground line-through sm:text-sm">
              {formatPrice(product.compareAtPrice, product.currency)}
            </p>
          ) : null}
        </div>
        <AddToCartButton productId={product.id} quantity={1} />
      </div>
    </article>
  );
}
