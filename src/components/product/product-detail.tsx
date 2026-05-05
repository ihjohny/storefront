import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetailVariantLayout } from "@/components/product/product-detail-variant-layout";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import { ProductDetailNarrative } from "@/components/product/product-detail-narrative";
import { ProductVariants } from "@/components/product/product-variants";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductDeliveryOptions } from "@/components/product/product-delivery-options";
import { SaleBadge } from "@/components/product/sale-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { getProductMedia } from "@/lib/utils/product-media";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import type { Product, ProductVariant } from "@/lib/types/product";
import type { CheckoutShippingCopy } from "@/lib/types/checkout-copy";

type ProductDetailProps = {
  product: Product;
  variants: ProductVariant[];
  locale: string;
  productDetailsTitle: string;
  deliveryOptionsTitle: string;
  deliveryOptionsLoading: string;
  deliveryOptionsFootnote: string;
  shippingMethodCopy: CheckoutShippingCopy;
};

export function ProductDetail({
  product,
  variants,
  locale,
  productDetailsTitle,
  deliveryOptionsTitle,
  deliveryOptionsLoading,
  deliveryOptionsFootnote,
  shippingMethodCopy,
}: ProductDetailProps) {
  const galleryImages = getProductMedia(product.images);
  /** Product is configured for variants and we loaded at least one SKU */
  const showVariantPdp = Boolean(product.hasVariants && variants.length > 0);

  const salePresentation = resolveSalePresentation({
    sellingPrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    productSaleDisplayMode: product.saleDisplayMode,
  });

  const galleryOverlay =
    !showVariantPdp && salePresentation.isOnSale ? (
      <SaleBadge
        presentation={salePresentation}
        currency={product.currency}
        size="prominent"
      />
    ) : undefined;

  return (
    <section className="space-y-12">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        {showVariantPdp ? (
          <ProductDetailVariantLayout
            product={product}
            variants={variants}
            galleryImages={galleryImages}
            productDetailsTitle={productDetailsTitle}
          />
        ) : (
          <>
            <ProductGallery images={galleryImages} fallbackAlt={product.name} overlay={galleryOverlay} />
            <div className="flex min-h-0 flex-col gap-5">
              <ProductDetailHeading product={product} />

              {product.hasVariants ? (
                <ProductVariants
                  productId={product.id}
                  variants={variants}
                  currency={product.currency}
                  basePrice={product.basePrice}
                  productCompareAtPrice={product.compareAtPrice}
                  productSaleDisplayMode={product.saleDisplayMode}
                  showQuantityStepper
                />
              ) : (
                <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <PriceDisplay
                      price={product.basePrice}
                      compareAtPrice={product.compareAtPrice}
                      currency={product.currency}
                      size="large"
                      productSaleDisplayMode={product.saleDisplayMode}
                    />
                    <SaleBadge
                      presentation={salePresentation}
                      currency={product.currency}
                      size="prominent"
                    />
                  </div>
                  <AddToCartButton productId={product.id} quantity={1} showQuantityStepper />
                </div>
              )}

              <ProductDetailNarrative product={product} sectionTitle={productDetailsTitle} />
            </div>
          </>
        )}
      </div>

      <ProductDeliveryOptions
        title={deliveryOptionsTitle}
        footnote={deliveryOptionsFootnote}
        loadingLabel={deliveryOptionsLoading}
        shippingCopy={shippingMethodCopy}
      />

      <ProductReviews productId={product.id} locale={locale} />
    </section>
  );
}
