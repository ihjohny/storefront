import { ProductGallery } from "@/components/product/product-gallery";
import { ProductVariants } from "@/components/product/product-variants";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductReviews } from "@/components/product/product-reviews";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product, ProductVariant } from "@/lib/types/product";

type ProductDetailProps = {
  product: Product;
  variants: ProductVariant[];
  locale: string;
};

export function ProductDetail({ product, variants, locale }: ProductDetailProps) {
  const hasVariants = product.hasVariants && variants.length > 0;

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <ProductGallery images={product.images} fallbackAlt={product.name} />
      <div className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>
          {product.shortDescription ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              {product.shortDescription}
            </p>
          ) : null}
        </div>

        {!hasVariants ? (
          <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-lg font-semibold">
              {formatPrice(product.basePrice, product.currency)}
            </p>
            <AddToCartButton productId={product.id} quantity={1} />
          </div>
        ) : (
          <ProductVariants
            productId={product.id}
            variants={variants}
            currency={product.currency}
            basePrice={product.basePrice}
          />
        )}

        <ProductReviews productId={product.id} locale={locale} />
      </div>
    </section>
  );
}
