"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/url";
import type { Media, Product, ProductVariant } from "@/lib/types/product";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductDetailHeading } from "@/components/product/product-detail-heading";
import { ProductDetailNarrative } from "@/components/product/product-detail-narrative";
import { SaleBadge } from "@/components/product/sale-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { resolveSalePresentation } from "@/lib/utils/sale-presentation";

type ProductDetailVariantLayoutProps = {
  product: Product;
  variants: ProductVariant[];
  galleryImages: Media[];
  productDetailsTitle: string;
};

type VariantOptionMap = Record<string, string>;

function toOptionMap(variant: ProductVariant): VariantOptionMap {
  return variant.options.reduce<VariantOptionMap>((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {});
}

export function ProductDetailVariantLayout({
  product,
  variants,
  galleryImages,
  productDetailsTitle,
}: ProductDetailVariantLayoutProps) {
  const optionNames = useMemo(
    () =>
      Array.from(new Set(variants.flatMap((variant) => variant.options.map((opt) => opt.name)))),
    [variants],
  );

  const initialSelection = useMemo(() => {
    const first = variants[0];
    if (!first) return {};
    return toOptionMap(first);
  }, [variants]);

  const [selectedOptions, setSelectedOptions] = useState<VariantOptionMap>(initialSelection);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => toOptionMap(variant)[name] === selectedOptions[name]),
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

  const safeImages = useMemo(() => galleryImages.filter((image) => Boolean(image?.url)), [galleryImages]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex];
  const activeUrl = getMediaUrl(activeImage?.url);

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {activeUrl ? (
            <Image
              src={activeUrl}
              alt={activeImage?.alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : null}
          {salePresentation.isOnSale ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[min(100%,12rem)]">
              <SaleBadge
                presentation={salePresentation}
                currency={product.currency}
                size="prominent"
              />
            </div>
          ) : null}
        </div>
        {safeImages.length > 1 ? (
          <div className="grid grid-cols-5 gap-2">
            {safeImages.map((image, index) => {
              const thumbUrl = getMediaUrl(image.url);
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-md border ${
                    index === activeIndex ? "border-primary" : "border-border"
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

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
                  .map((variant) => toOptionMap(variant)[name])
                  .filter((value): value is string => Boolean(value)),
              ),
            );
            return (
              <label key={name} className="block space-y-1">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <select
                  value={selectedOptions[name] ?? values[0] ?? ""}
                  onChange={(event) =>
                    setSelectedOptions((prev) => ({ ...prev, [name]: event.target.value }))
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
          <AddToCartButton productId={product.id} variantId={selectedVariant?.id} quantity={1} />
        </div>
        <ProductDetailNarrative product={product} sectionTitle={productDetailsTitle} />
      </div>
    </>
  );
}
