import {
  ProductGallery,
  type ProductGalleryLabels,
} from "@/components/product/product-gallery";
import { ProductDetailVariantLayout } from "@/components/product/product-detail-variant-layout";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import { ProductDetailNarrative } from "@/components/product/product-detail-narrative";
import { ProductVariants } from "@/components/product/product-variants";
import { WarehouseAwareAddToCartButton } from "@/components/product/warehouse-aware-add-to-cart-button";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductDeliveryOptions } from "@/components/product/product-delivery-options";
import { SaleBadge } from "@/components/product/sale-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { features } from "@/lib/config/features";
import { getProductMedia } from "@/lib/utils/product-media";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import type { Product, ProductVariant } from "@/lib/types/product";
import type { CheckoutShippingCopy } from "@/lib/types/checkout-copy";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";
import { ProductCompareButton } from "@/components/product/product-compare-button";

type ProductDetailProps = {
  product: Product;
  variants: ProductVariant[];
  locale: string;
  productDetailsTitle: string;
  productDetailsSeeLess: string;
  productGalleryLabels: ProductGalleryLabels;
  deliveryOptionsTitle: string;
  deliveryOptionsLoading: string;
  deliveryOptionsFootnote: string;
  shippingMethodCopy: CheckoutShippingCopy;
  /** From `?variant=` — selects matching SKU on load (e.g. cart → PDP). */
  initialVariantId?: string;
  productOutOfStockLabel: string;
  productCheckingAvailabilityLabel: string;
  productAvailabilityCheckFailedLabel: string;
  compareLabels?: ProductCompareLabels | null;
};

export function ProductDetail({
  product,
  variants,
  locale,
  productDetailsTitle,
  productDetailsSeeLess,
  productGalleryLabels,
  deliveryOptionsTitle,
  deliveryOptionsLoading,
  deliveryOptionsFootnote,
  shippingMethodCopy,
  initialVariantId,
  productOutOfStockLabel,
  productCheckingAvailabilityLabel,
  productAvailabilityCheckFailedLabel,
  compareLabels = null,
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
    <section className="space-y-10 lg:space-y-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
        {showVariantPdp ? (
          <ProductDetailVariantLayout
            product={product}
            variants={variants}
            galleryLabels={productGalleryLabels}
            initialVariantId={initialVariantId}
            outOfStockLabel={productOutOfStockLabel}
            checkingAvailabilityLabel={productCheckingAvailabilityLabel}
            availabilityCheckFailedLabel={productAvailabilityCheckFailedLabel}
            compareLabels={compareLabels}
          />
        ) : (
          <>
            <ProductGallery
              images={galleryImages}
              fallbackAlt={product.name}
              labels={productGalleryLabels}
              overlay={galleryOverlay}
            />
            <div className="flex min-h-0 flex-col gap-5">
              {product.hasVariants ? (
                <ProductVariants
                  product={product}
                  productId={product.id}
                  variants={variants}
                  currency={product.currency}
                  basePrice={product.basePrice}
                  productCompareAtPrice={product.compareAtPrice}
                  productSaleDisplayMode={product.saleDisplayMode}
                  showQuantityStepper
                  initialVariantId={initialVariantId}
                  outOfStockLabel={productOutOfStockLabel}
                  checkingAvailabilityLabel={productCheckingAvailabilityLabel}
                  availabilityCheckFailedLabel={productAvailabilityCheckFailedLabel}
                  compareLabels={compareLabels}
                />
              ) : (
                <>
                  <ProductDetailHeading product={product} />
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
                  <div className="flex flex-wrap items-end gap-2 pt-1">
                    <div className="min-w-0 flex-1 [&>*]:w-full">
                      <WarehouseAwareAddToCartButton
                        productId={product.id}
                        quantity={1}
                        showQuantityStepper
                        outOfStockLabel={productOutOfStockLabel}
                        checkingAvailabilityLabel={productCheckingAvailabilityLabel}
                        availabilityCheckFailedLabel={productAvailabilityCheckFailedLabel}
                      />
                    </div>
                    {compareLabels ? (
                      <ProductCompareButton productId={product.id} labels={compareLabels} />
                    ) : null}
                  </div>
                </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <ProductDetailNarrative
        product={product}
        sectionTitle={productDetailsTitle}
        collapsible
        defaultOpen={features.pdpDescriptionDefaultOpen}
        seeLessLabel={productDetailsSeeLess}
      />

      <ProductDeliveryOptions
        title={deliveryOptionsTitle}
        footnote={deliveryOptionsFootnote}
        loadingLabel={deliveryOptionsLoading}
        shippingCopy={shippingMethodCopy}
        collapsible
        defaultOpen
      />

      <ProductReviews productId={product.id} locale={locale} />
    </section>
  );
}
