"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { getProductVariants } from "@/lib/api/products";
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
import { getProductMedia } from "@/lib/utils/product-media";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";

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
}: ProductQuickViewProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);

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
    }
  }, [open]);

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
              <WarehouseAwareAddToCartButton
                productId={product.id}
                quantity={1}
                showQuantityStepper
                outOfStockLabel={labels.outOfStock}
                checkingAvailabilityLabel={labels.checkingAvailability}
                availabilityCheckFailedLabel={labels.availabilityCheckFailed}
              />
            </div>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={() => onOpenChange(false)}>
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
