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
import { BundleItemInsights } from "@/components/product/bundle-item-insights";
import { WishlistToggleButton } from "@/components/product/wishlist-toggle-button";

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
  bundleIncludesTitle: string;
  bundleRegularTotalLabel: string;
  bundleYouPayLabel: string;
  bundleYouSaveLabel: string;
  bundleItemFallbackLabel: string;
  bundleItemQtyLabel: string;
  bundleViewDetailsLabel: string;
  bundleItemDialogTitle: string;
  bundleItemViewOnlyNotice: string;
  bundleGoToProductLabel: string;
  bundleItemCloseLabel: string;
  bundleItemSkuLabel: string;
  bundleItemUnitPriceLabel: string;
  bundleItemCompareAtLabel: string;
  bundleItemQuantityLabel: string;
  bundleItemLineTotalLabel: string;
};

type BundleBreakdownLine = {
  key: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  sku?: string | null;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  imageUrl?: string | null;
};

function getBundleBreakdown(product: Product, fallbackTitle: string) {
  if (product.productType !== "bundle" || !Array.isArray(product.bundleItems) || product.bundleItems.length === 0) {
    return null;
  }

  const lines: BundleBreakdownLine[] = [];
  let regularTotal = 0;

  for (let i = 0; i < product.bundleItems.length; i++) {
    const row = product.bundleItems[i];
    const rowProduct =
      row && typeof row.product === "object" && row.product !== null ? row.product : null;
    const rowVariant =
      row && row.variant && typeof row.variant === "object" ? row.variant : null;
    const quantity = Math.max(1, Number(row?.quantity ?? 1));

    const unitPrice = typeof rowVariant?.price === "number"
      ? rowVariant.price
      : typeof rowProduct?.basePrice === "number"
        ? rowProduct.basePrice
        : null;
    if (unitPrice == null) {
      continue;
    }

    const lineTitle = rowVariant?.name
      ? `${rowProduct?.name ?? fallbackTitle} - ${rowVariant.name}`
      : rowProduct?.name ?? fallbackTitle;
    const lineTotal = unitPrice * quantity;
    const media = rowProduct?.images ? getProductMedia(rowProduct.images) : [];

    lines.push({
      key: `${toBundleLineId(row.product)}:${toBundleLineId(row.variant)}:${i}`,
      title: lineTitle,
      quantity,
      unitPrice,
      lineTotal,
      currency:
        (typeof rowVariant?.product === "object" &&
        rowVariant.product &&
        typeof rowVariant.product.currency === "string"
          ? rowVariant.product.currency
          : null) ??
        rowProduct?.currency ??
        product.currency,
      sku: rowVariant?.sku ?? rowProduct?.sku ?? null,
      compareAtPrice:
        typeof rowVariant?.compareAtPrice === "number"
          ? rowVariant.compareAtPrice
          : typeof rowProduct?.compareAtPrice === "number"
            ? rowProduct.compareAtPrice
            : null,
      shortDescription: rowProduct?.shortDescription ?? null,
      productName: rowProduct?.name ?? null,
      productSlug: rowProduct?.slug ?? null,
      imageUrl: rowVariant?.image?.url ?? media[0]?.url ?? null,
    });
    regularTotal += lineTotal;
  }

  if (lines.length === 0) {
    return null;
  }

  return {
    lines,
    regularTotal,
    bundlePrice: product.basePrice,
    savings: Math.max(0, regularTotal - product.basePrice),
  };
}

function toBundleLineId(value: unknown): string {
  if (!value) return "none";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return id == null ? "none" : String(id);
  }
  return "none";
}

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
  bundleIncludesTitle,
  bundleRegularTotalLabel,
  bundleYouPayLabel,
  bundleYouSaveLabel,
  bundleItemFallbackLabel,
  bundleItemQtyLabel,
  bundleViewDetailsLabel,
  bundleItemDialogTitle,
  bundleItemViewOnlyNotice,
  bundleGoToProductLabel,
  bundleItemCloseLabel,
  bundleItemSkuLabel,
  bundleItemUnitPriceLabel,
  bundleItemCompareAtLabel,
  bundleItemQuantityLabel,
  bundleItemLineTotalLabel,
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
  const bundleBreakdown = getBundleBreakdown(product, bundleItemFallbackLabel);

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
                    <div className="min-w-0 flex-1 *:w-full">
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
                    <WishlistToggleButton locale={locale} productId={product.id} />
                  </div>
                </div>
                {bundleBreakdown ? (
                  <BundleItemInsights
                    items={bundleBreakdown.lines}
                    regularTotal={bundleBreakdown.regularTotal}
                    bundlePrice={bundleBreakdown.bundlePrice}
                    savings={bundleBreakdown.savings}
                    locale={locale}
                    copy={{
                      includesTitle: bundleIncludesTitle,
                      qtyLabel: bundleItemQtyLabel,
                      viewDetailsLabel: bundleViewDetailsLabel,
                      regularTotalLabel: bundleRegularTotalLabel,
                      bundlePriceLabel: bundleYouPayLabel,
                      savingsLabel: bundleYouSaveLabel,
                      dialogTitle: bundleItemDialogTitle,
                      viewOnlyNotice: bundleItemViewOnlyNotice,
                      goToProductLabel: bundleGoToProductLabel,
                      closeLabel: bundleItemCloseLabel,
                      skuLabel: bundleItemSkuLabel,
                      unitPriceLabel: bundleItemUnitPriceLabel,
                      compareAtLabel: bundleItemCompareAtLabel,
                      quantityLabel: bundleItemQuantityLabel,
                      lineTotalLabel: bundleItemLineTotalLabel,
                    }}
                  />
                ) : null}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showVariantPdp ? (
        <div>
          <WishlistToggleButton locale={locale} productId={product.id} />
        </div>
      ) : null}

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
