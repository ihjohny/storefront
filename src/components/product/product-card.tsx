import Image from "next/image";
import Link from "next/link";
import { features } from "@/lib/config/features";
import { formatPrice } from "@/lib/utils/format-price";
import { getMediaUrl } from "@/lib/utils/url";
import type { Product } from "@/lib/types/product";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

type ProductCardProps = {
  product: Product;
  locale: string;
};

function getVendorName(tenant: Product["tenant"]) {
  if (!tenant || typeof tenant === "string") {
    return null;
  }
  return tenant.name;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const firstImage = product.images?.[0];
  const imageUrl = getMediaUrl(firstImage?.url);
  const vendorName = getVendorName(product.tenant);
  const productHref = `/${locale}/products/${product.slug}`;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Link href={productHref} className="block">
        <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-900">
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
        {features.multivendor && vendorName ? (
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {vendorName}
          </p>
        ) : null}
        <Link href={productHref} className="block">
          <h3 className="line-clamp-2 text-sm font-medium text-slate-900 hover:underline dark:text-slate-100 sm:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatPrice(product.basePrice, product.currency)}
          </p>
          {typeof product.compareAtPrice === "number" ? (
            <p className="text-xs text-slate-500 line-through dark:text-slate-400 sm:text-sm">
              {formatPrice(product.compareAtPrice, product.currency)}
            </p>
          ) : null}
        </div>
        <AddToCartButton productId={product.id} quantity={1} />
      </div>
    </article>
  );
}
