"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/types/product";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import type { ProductGalleryLabels } from "@/components/product/product-gallery";
import { ProductGallery } from "@/components/product/product-gallery";
import { SaleBadge } from "@/components/product/sale-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";
import { getProductGalleryMedia } from "@/lib/utils/product-media";
import {
  resolveVariantOptionMapAfterChange,
  variantToOptionMap,
  type VariantOptionMap,
} from "@/lib/utils/variant-selection";

type ProductDetailVariantLayoutProps = {
  product: Product;
  variants: ProductVariant[];
  galleryLabels: ProductGalleryLabels;
};

export function ProductDetailVariantLayout({
  product,
  variants,
  galleryLabels,
}: ProductDetailVariantLayoutProps) {
  const optionNames = useMemo(
    () =>
      Array.from(new Set(variants.flatMap((variant) => variant.options.map((opt) => opt.name)))),
    [variants],
  );

  const initialSelection = useMemo(() => {
    const first = variants[0];
    if (!first) return {};
    return variantToOptionMap(first);
  }, [variants]);

  const [selectedOptions, setSelectedOptions] = useState<VariantOptionMap>(initialSelection);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => variantToOptionMap(variant)[name] === selectedOptions[name]),
      ) ?? variants[0],
    [optionNames, selectedOptions, variants],
  );

  const price = selectedVariant?.price ?? product.basePrice;
  const compareAt =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice ?? null;

  const salePresentation = useMemo(
    () =>
      resolveSalePresentation({
        sellingPrice: price,
        compareAtPrice: compareAt,
        productSaleDisplayMode: product.saleDisplayMode,
        variantSaleDisplayMode: selectedVariant?.saleDisplayMode,
      }),
    [price, compareAt, product.saleDisplayMode, selectedVariant?.saleDisplayMode],
  );

  const displayImages = useMemo(
    () => getProductGalleryMedia(product.images, selectedVariant?.image ?? null),
    [product.images, selectedVariant?.image],
  );

  const galleryOverlay = salePresentation.isOnSale ? (
    <SaleBadge
      presentation={salePresentation}
      currency={product.currency}
      size="prominent"
    />
  ) : undefined;

  return (
    <>
      <ProductGallery
        key={selectedVariant?.id ?? product.id}
        images={displayImages}
        fallbackAlt={product.name}
        labels={galleryLabels}
        overlay={galleryOverlay}
      />

      <div className="flex min-h-0 flex-col gap-5">
        <ProductDetailHeading product={product} />
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <PriceDisplay
              price={price}
              compareAtPrice={compareAt}
              currency={product.currency}
              size="large"
              productSaleDisplayMode={product.saleDisplayMode}
              variantSaleDisplayMode={selectedVariant?.saleDisplayMode}
            />
            <SaleBadge
              presentation={salePresentation}
              currency={product.currency}
              size="prominent"
            />
          </div>
          {optionNames.map((name) => {
            const values = Array.from(
              new Set(
                variants
                  .map((variant) => variantToOptionMap(variant)[name])
                  .filter((value): value is string => Boolean(value)),
              ),
            );
            return (
              <label key={name} className="block space-y-1">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <select
                  value={selectedOptions[name] ?? values[0] ?? ""}
                  onChange={(event) =>
                    setSelectedOptions(
                      resolveVariantOptionMapAfterChange({
                        variants,
                        optionNames,
                        selectedOptions,
                        changedName: name,
                        changedValue: event.target.value,
                      }),
                    )
                  }
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-card-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {values.map((value) => (
                    <option key={`${name}-${value}`} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
          <AddToCartButton productId={product.id} variantId={selectedVariant?.id} quantity={1} showQuantityStepper />
        </div>
      </div>
    </>
  );
}
