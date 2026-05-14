"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { getProductById, getProductVariants } from "@/lib/api/products";
import { features } from "@/lib/config/features";
import { WarehouseAwareAddToCartButton } from "@/components/product/warehouse-aware-add-to-cart-button";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import { ProductDetailNarrative } from "@/components/product/product-detail-narrative";
import { ProductDetailVariantLayout } from "@/components/product/product-detail-variant-layout";
import type { ProductGalleryLabels } from "@/components/product/product-gallery";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductVariants } from "@/components/product/product-variants";
import { SaleBadge } from "@/components/product/sale-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import type { Product, ProductVariant } from "@/lib/types/product";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";
import { ProductCompareButton } from "@/components/product/product-compare-button";
import { getProductMedia } from "@/lib/utils/product-media";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import { formatPrice } from "@/lib/utils/format-price";

export type QuickViewCopy = {
  dialogTitle: string;
  openTrigger: string;
  close: string;
  viewFullDetails: string;
  loadingVariants: string;
  variantsLoadError: string;
  /** PDP parity — warehouse availability UI blocks add-to-cart */
  outOfStock: string;
  checkingAvailability: string;
  availabilityCheckFailed: string;
  bundleIncludesTitle: string;
  bundleLoadingItems: string;
  bundleRegularTotal: string;
  bundleYouPay: string;
  bundleYouSave: string;
  bundleQty: string;
};

type ProductQuickViewProps = {
  product: Product;
  locale: string;
  productHref: string;
  labels: QuickViewCopy;
  galleryLabels: ProductGalleryLabels;
  productDetailsTitle: string;
  productDetailsSeeLess: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compareLabels?: ProductCompareLabels | null;
};

function getVendor(tenant: Product["tenant"]) {
  if (!tenant || typeof tenant === "string") {
    return null;
  }
  return tenant;
}

export function ProductQuickView({
  product,
  locale,
  productHref,
  labels,
  galleryLabels,
  productDetailsTitle,
  productDetailsSeeLess,
  open,
  onOpenChange,
  compareLabels = null,
}: ProductQuickViewProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);
  const [bundleProductDetail, setBundleProductDetail] = useState<Product | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const galleryImages = getProductMedia(product.images);
  const vendor = getVendor(product.tenant);

  useEffect(() => {
    if (!open || !product.hasVariants) {
      return;
    }

    let cancelled = false;
    setVariantsLoading(true);
    setVariantsError(null);

    void getProductVariants(product.id, locale)
      .then((docs) => {
        if (!cancelled) {
          setVariants(docs);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVariantsError(labels.variantsLoadError);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setVariantsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, product.hasVariants, product.id, locale, labels.variantsLoadError]);

  useEffect(() => {
    if (!open) {
      setVariants([]);
      setVariantsError(null);
      setVariantsLoading(false);
      setBundleProductDetail(null);
      setBundleLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || product.productType !== "bundle") {
      return;
    }

    let cancelled = false;
    setBundleLoading(true);
    void getProductById(product.id, locale)
      .then((doc) => {
        if (!cancelled && doc?.productType === "bundle") {
          setBundleProductDetail(doc);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBundleLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, product.id, product.productType, locale]);

  const showVariantPdp = Boolean(product.hasVariants && variants.length > 0 && !variantsLoading);

  const productSalePresentation = resolveSalePresentation({
    sellingPrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    productSaleDisplayMode: product.saleDisplayMode,
  });

  const simpleGalleryOverlay =
    !showVariantPdp && productSalePresentation.isOnSale ? (
      <SaleBadge
        presentation={productSalePresentation}
        currency={product.currency}
        size="prominent"
      />
    ) : undefined;
  const bundleBreakdown = getBundleBreakdown(bundleProductDetail ?? product);

  function renderPrimaryGrid() {
    if (product.hasVariants && variantsLoading) {
      return (
        <>
          <ProductGallery
            images={galleryImages}
            fallbackAlt={product.name}
            labels={galleryLabels}
            overlay={simpleGalleryOverlay}
          />
          <div className="flex min-h-0 flex-col gap-5">
            <ProductDetailHeading product={product} />
            <p className="text-sm text-muted-foreground">{labels.loadingVariants}</p>
          </div>
        </>
      );
    }

    if (product.hasVariants && variantsError) {
      return (
        <>
          <ProductGallery
            images={galleryImages}
            fallbackAlt={product.name}
            labels={galleryLabels}
            overlay={simpleGalleryOverlay}
          />
          <div className="flex min-h-0 flex-col gap-5">
            <ProductDetailHeading product={product} />
            <p className="text-sm text-destructive">{variantsError}</p>
          </div>
        </>
      );
    }

    if (showVariantPdp) {
      return (
        <ProductDetailVariantLayout
          product={product}
          variants={variants}
          galleryLabels={galleryLabels}
          syncVariantSearchParam={false}
          outOfStockLabel={labels.outOfStock}
          checkingAvailabilityLabel={labels.checkingAvailability}
          availabilityCheckFailedLabel={labels.availabilityCheckFailed}
          compareLabels={compareLabels}
        />
      );
    }

    return (
      <>
        <ProductGallery
          images={galleryImages}
          fallbackAlt={product.name}
          labels={galleryLabels}
          overlay={simpleGalleryOverlay}
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
              syncVariantSearchParam={false}
              outOfStockLabel={labels.outOfStock}
              checkingAvailabilityLabel={labels.checkingAvailability}
              availabilityCheckFailedLabel={labels.availabilityCheckFailed}
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
                  presentation={productSalePresentation}
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
                    outOfStockLabel={labels.outOfStock}
                    checkingAvailabilityLabel={labels.checkingAvailability}
                    availabilityCheckFailedLabel={labels.availabilityCheckFailed}
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
    );
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-60" onClose={() => onOpenChange(false)}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transform transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <DialogTitle className="sr-only">
                {labels.dialogTitle}: {product.name}
              </DialogTitle>

              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 pb-3 pt-4 sm:px-6">
                <Link
                  href={productHref}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {labels.viewFullDetails}
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  {labels.close}
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
                <div className="space-y-8">
                  {features.multivendor && vendor?.slug ? (
                    <Link
                      href={`/${locale}/store/${vendor.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex text-xs font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:underline"
                    >
                      by {vendor.name}
                    </Link>
                  ) : null}

                  <div className="grid gap-6 lg:grid-cols-2 lg:items-start">{renderPrimaryGrid()}</div>
                  {product.productType === "bundle" ? (
                    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {labels.bundleIncludesTitle}
                      </h3>
                      {bundleLoading ? (
                        <p className="text-sm text-muted-foreground">{labels.bundleLoadingItems}</p>
                      ) : bundleBreakdown ? (
                        <>
                          <div className="space-y-2 text-sm">
                            {bundleBreakdown.lines.map((line) => (
                              <div
                                key={line.key}
                                className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground">{line.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {labels.bundleQty} {line.quantity} x{" "}
                                    {formatPrice(line.unitPrice, line.currency)}
                                  </p>
                                </div>
                                <p className="shrink-0 font-medium text-foreground">
                                  {formatPrice(line.lineTotal, line.currency)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 border-t border-border pt-2 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>{labels.bundleRegularTotal}</span>
                              <span>{formatPrice(bundleBreakdown.regularTotal, product.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold text-foreground">
                              <span>{labels.bundleYouPay}</span>
                              <span>{formatPrice(bundleBreakdown.bundlePrice, product.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                              <span>{labels.bundleYouSave}</span>
                              <span>{formatPrice(bundleBreakdown.savings, product.currency)}</span>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  <ProductDetailNarrative
                    product={product}
                    sectionTitle={productDetailsTitle}
                    collapsible
                    defaultOpen={features.pdpDescriptionDefaultOpen}
                    seeLessLabel={productDetailsSeeLess}
                  />

                  <div className="border-t border-border pt-6">
                    <Link
                      href={productHref}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      {labels.viewFullDetails}
                    </Link>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

function getBundleBreakdown(product: Product) {
  if (product.productType !== "bundle" || !Array.isArray(product.bundleItems) || product.bundleItems.length === 0) {
    return null;
  }

  const lines: Array<{
    key: string;
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    currency: string;
  }> = [];
  let regularTotal = 0;

  for (let i = 0; i < product.bundleItems.length; i++) {
    const row = product.bundleItems[i];
    const rowProduct = row && typeof row.product === "object" && row.product !== null ? row.product : null;
    const rowVariant = row && row.variant && typeof row.variant === "object" ? row.variant : null;
    const quantity = Math.max(1, Number(row?.quantity ?? 1));
    const unitPrice =
      typeof rowVariant?.price === "number"
        ? rowVariant.price
        : typeof rowProduct?.basePrice === "number"
          ? rowProduct.basePrice
          : null;
    if (unitPrice == null) {
      continue;
    }

    const title = rowVariant?.name
      ? `${rowProduct?.name ?? "Item"} - ${rowVariant.name}`
      : rowProduct?.name ?? "Item";
    const lineTotal = unitPrice * quantity;
    lines.push({
      key: `${toBundleLineId(row.product)}:${toBundleLineId(row.variant)}:${i}`,
      title,
      quantity,
      unitPrice,
      lineTotal,
      currency: rowProduct?.currency ?? product.currency,
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
