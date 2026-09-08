"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProductById, getProductVariants } from "@/lib/api/products";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";
import {
  type CompareLineItem,
  parseCompareItemsToken,
  parseLegacyCompareIdsParam,
} from "@/lib/product-compare/compare-line-items";
import { MAX_PRODUCT_COMPARE_ITEMS } from "@/lib/product-compare/constants";
import { useProductCompare } from "@/providers/product-compare-provider";
import { PriceDisplay } from "@/components/shared/price-display";
import type { Product, ProductVariant } from "@/lib/types/product";
import { features } from "@/lib/config/features";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductGalleryMedia } from "@/lib/utils/product-media";
import {
  COMPARE_LABEL_COLUMN_CLASS,
  CompareLoadingSkeleton,
} from "@/app/[locale]/compare/compare-loading-skeleton";

import type { Attribute } from "@/lib/types/attribute";

function categorySummary(categories: Product["categories"]): string {
  if (!categories?.length) {
    return "—";
  }
  return categories
    .map((c) => (typeof c === "object" && c && "name" in c ? c.name : String(c)))
    .join(", ");
}

function vendorLabel(tenant: Product["tenant"]): string | null {
  if (!tenant || typeof tenant === "string") {
    return null;
  }
  return tenant.name;
}

function variantOptionSummary(variant: ProductVariant | null): string {
  if (!variant?.options?.length) {
    return "—";
  }
  return variant.options.map((o) => `${o.name}: ${o.value}`).join(" · ");
}

function productDetailHref(locale: string, slug: string, variantId: string | null): string {
  const base = `/${locale}/products/${slug}`;
  return variantId ? `${base}?variant=${encodeURIComponent(variantId)}` : base;
}

function getLocalizedText(
  value: string | Record<string, string> | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[locale] || value.en || Object.values(value)[0] || fallback;
  }
  return String(value);
}

interface ComparedSpecMeta {
  key: string;
  label: string;
  group: string;
  unit: string;
}

function extractAllComparedSpecs(products: Product[], locale: string): {
  groups: string[];
  specsByGroup: Record<string, ComparedSpecMeta[]>;
} {
  const groupOrder = [
    "General",
    "Display",
    "Performance",
    "Storage & Memory",
    "Battery & Power",
    "Connectivity & Ports",
    "Audio & Multimedia",
    "Durability & Build",
    "Additional Specifications",
  ];

  const seenKeys = new Set<string>();
  const specsByGroup: Record<string, ComparedSpecMeta[]> = {};

  products.forEach((p) => {
    if (!Array.isArray(p.specifications)) return;
    p.specifications.forEach((spec) => {
      if (!spec || !spec.key) return;
      if (seenKeys.has(spec.key)) return;
      seenKeys.add(spec.key);

      const attrDoc =
        typeof spec.attribute === "object" && spec.attribute !== null
          ? (spec.attribute as Attribute)
          : null;

      const label =
        spec.label ||
        (attrDoc ? getLocalizedText(attrDoc.label, locale) : "") ||
        spec.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      const group =
        spec.group ||
        attrDoc?.defaultGroup ||
        "Additional Specifications";

      const unit = spec.unit || attrDoc?.unit || "";

      if (!specsByGroup[group]) {
        specsByGroup[group] = [];
      }
      specsByGroup[group].push({
        key: spec.key,
        label,
        group,
        unit,
      });
    });
  });

  const sortedGroups = Object.keys(specsByGroup).sort((a, b) => {
    const idxA = groupOrder.indexOf(a);
    const idxB = groupOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return { groups: sortedGroups, specsByGroup };
}

function renderProductSpecValue(product: Product, specMeta: ComparedSpecMeta, locale: string): React.ReactNode {
  if (!Array.isArray(product.specifications)) return "—";
  const found = product.specifications.find((s) => s && s.key === specMeta.key);
  if (!found) return "—";

  const hasSingleVal =
    found.value !== null &&
    found.value !== undefined &&
    found.value !== "";
  const hasMultiVal = Array.isArray(found.values) && found.values.length > 0;

  if (!hasSingleVal && !hasMultiVal) return "—";

  const attrDoc =
    typeof found.attribute === "object" && found.attribute !== null
      ? (found.attribute as Attribute)
      : null;

  if (hasMultiVal && Array.isArray(found.values)) {
    return (
      <div className="flex flex-wrap gap-1">
        {found.values.map((v, i) => {
          const opt = attrDoc?.options?.find((o) => o.value.toLowerCase() === v.toLowerCase());
          const text = opt ? getLocalizedText(opt.label, locale, v) : v;
          return (
            <span
              key={i}
              className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground"
            >
              {text}
            </span>
          );
        })}
      </div>
    );
  }

  const rawVal = String(found.value).trim();
  if (attrDoc?.options && attrDoc.options.length > 0) {
    const match = attrDoc.options.find((o) => o.value.toLowerCase() === rawVal.toLowerCase());
    if (match) {
      const optText = getLocalizedText(match.label, locale, rawVal);
      return match.hexColor ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-3 rounded-full border border-border shrink-0"
            style={{ backgroundColor: match.hexColor }}
          />
          <span>{optText}</span>
        </span>
      ) : (
        optText
      );
    }
  }

  if (rawVal.toLowerCase() === "true") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
        ✓ Yes
      </span>
    );
  }
  if (rawVal.toLowerCase() === "false") {
    return <span className="text-muted-foreground">✕ No</span>;
  }

  const unit = found.unit || specMeta.unit;
  if (unit && !rawVal.toLowerCase().endsWith(unit.toLowerCase())) {
    return `${rawVal} ${unit}`;
  }

  return rawVal;
}

type ResolvedCompareRow = {
  line: CompareLineItem;
  product: Product;
  variant: ProductVariant | null;
};

function SpecPair({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 px-4 py-2.5 text-sm">
      <span className="w-[38%] max-w-[11rem] shrink-0 font-medium text-muted-foreground sm:w-[32%]">
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-foreground">{children}</span>
    </div>
  );
}

export function ComparePageClient({
  locale,
  labels,
}: {
  locale: string;
  labels: ProductCompareLabels;
}) {
  const searchParams = useSearchParams();
  /** Stable primitives — `searchParams` object identity can churn without URL changes. */
  const urlItemsRaw = searchParams.get("items") ?? "";
  const urlIdsRaw = searchParams.get("ids") ?? "";

  const { entries, hydrated, replaceEntries, removeEntry, clearAll } = useProductCompare();
  const [rows, setRows] = useState<ResolvedCompareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const fromUrl =
      urlItemsRaw.trim() ?
        parseCompareItemsToken(urlItemsRaw)
      : parseLegacyCompareIdsParam(urlIdsRaw.trim() ? urlIdsRaw : null);
    if (fromUrl.length === 0) {
      return;
    }
    replaceEntries(fromUrl);
  }, [hydrated, replaceEntries, urlItemsRaw, urlIdsRaw]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (entries.length === 0) {
      setRows([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadErrorLabel = labels.loadError;

    void (async () => {
      try {
        const uniqueProductIds = [...new Set(entries.map((e) => e.productId))];
        const productById = new Map<string, Product | null>();
        await Promise.all(
          uniqueProductIds.map(async (id) => {
            const product = await getProductById(id, locale);
            productById.set(id, product);
          }),
        );

        const variantByProductId = new Map<string, ProductVariant[]>();
        const variantProductIds = [
          ...new Set(entries.filter((e) => e.variantId).map((e) => e.productId)),
        ];
        await Promise.all(
          variantProductIds.map(async (pid) => {
            const list = await getProductVariants(pid, locale);
            variantByProductId.set(pid, list);
          }),
        );

        const resolved: ResolvedCompareRow[] = [];
        for (const line of entries) {
          const product = productById.get(line.productId);
          if (!product) {
            continue;
          }
          let variant: ProductVariant | null = null;
          if (line.variantId) {
            const list = variantByProductId.get(line.productId) ?? [];
            variant = list.find((v) => v.id === line.variantId) ?? null;
          }
          resolved.push({ line, product, variant });
        }

        if (cancelled) {
          return;
        }
        setRows(resolved);
        if (resolved.length < entries.length) {
          setError(loadErrorLabel);
        }
      } catch {
        if (!cancelled) {
          setError(loadErrorLabel);
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entries, hydrated, locale, labels.loadError]);

  const allComparedSpecs = useMemo(() => {
    const products = rows.map((r) => r.product);
    return extractAllComparedSpecs(products, locale);
  }, [rows, locale]);

  if (!features.productCompareEnabled) {
    return null;
  }

  const skeletonColumns =
    !hydrated ? 3 : Math.min(Math.max(entries.length, 1), MAX_PRODUCT_COMPARE_ITEMS);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{labels.pageTitle}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{labels.pageDescription}</p>
          </div>
          {entries.length > 0 ? (
            <button
              type="button"
              onClick={() => clearAll()}
              className="self-start rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted sm:self-auto"
            >
              {labels.clearAll}
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!hydrated || loading ? (
        <CompareLoadingSkeleton columnCount={skeletonColumns} labels={labels} />
      ) : entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
          {labels.emptyState}
        </p>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {rows.map(({ line, product, variant }) => {
              const gallery = getProductGalleryMedia(product.images, variant?.image ?? null);
              const firstImage = gallery[0];
              const imgUrl = getMediaUrl(firstImage?.url);
              const sku = variant?.sku?.trim() || product.sku?.trim() || "—";
              const price = variant?.price ?? product.basePrice;
              const compareAt = variant?.compareAtPrice ?? product.compareAtPrice ?? null;
              const href = productDetailHref(locale, product.slug, line.variantId);
              return (
                <article
                  key={`${line.productId}:${line.variantId ?? ""}`}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                  <div className="flex gap-3 border-b border-border p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={firstImage?.alt || product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                      <Link
                        href={href}
                        className="line-clamp-2 text-base font-semibold leading-snug text-primary underline-offset-4 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeEntry(line.productId, line.variantId)}
                        className="self-start rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium transition hover:bg-muted"
                      >
                        {labels.removeColumn}
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-border bg-muted/20">
                    <SpecPair label={labels.tableVariant}>{variantOptionSummary(variant)}</SpecPair>
                    <SpecPair label={labels.tableSku}>{sku}</SpecPair>
                    <SpecPair label={labels.tablePrice}>
                      <PriceDisplay
                        price={price}
                        compareAtPrice={compareAt}
                        currency={product.currency}
                        productSaleDisplayMode={product.saleDisplayMode}
                        variantSaleDisplayMode={variant?.saleDisplayMode}
                      />
                    </SpecPair>
                    {features.multivendor ? (
                      <SpecPair label={labels.tableVendor}>
                        {vendorLabel(product.tenant) ?? "—"}
                      </SpecPair>
                    ) : null}
                    <SpecPair label={labels.tableCategories}>
                      {categorySummary(product.categories)}
                    </SpecPair>
                    <SpecPair label={labels.tableSummary}>
                      <span className="text-muted-foreground">{product.shortDescription?.trim() || "—"}</span>
                    </SpecPair>
                    {/* Dynamic Specifications for Mobile Card */}
                    {allComparedSpecs.groups.map((groupName) => {
                      const specItems = allComparedSpecs.specsByGroup[groupName] || [];
                      return (
                        <div key={groupName} className="border-t border-border bg-muted/40 pt-1 pb-1">
                          <div className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {groupName}
                          </div>
                          {specItems.map((specMeta) => (
                            <SpecPair key={specMeta.key} label={specMeta.label}>
                              {renderProductSpecValue(product, specMeta, locale)}
                            </SpecPair>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <div className="overflow-x-auto overscroll-x-contain">
              <table
                className="w-full min-w-[520px] border-collapse text-left text-sm"
                aria-label={labels.pageTitle}
              >
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className={`${COMPARE_LABEL_COLUMN_CLASS} align-bottom`} aria-hidden />
                    {rows.map(({ line, product, variant }) => {
                      const gallery = getProductGalleryMedia(product.images, variant?.image ?? null);
                      const firstImage = gallery[0];
                      const imgUrl = getMediaUrl(firstImage?.url);
                      const href = productDetailHref(locale, product.slug, line.variantId);
                      return (
                        <th
                          key={`${line.productId}:${line.variantId ?? ""}`}
                          scope="col"
                          className="border-l border-border px-3 py-3 align-bottom font-normal"
                        >
                          <div className="mx-auto flex max-w-[13rem] flex-col items-center gap-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeEntry(line.productId, line.variantId)}
                              className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium transition hover:bg-muted"
                              aria-label={`${labels.removeColumn}: ${product.name}`}
                            >
                              {labels.removeColumn}
                            </button>
                            <div className="relative aspect-square w-full max-w-[9rem] overflow-hidden rounded-lg bg-muted">
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={firstImage?.alt || product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 900px) 144px, 160px"
                                />
                              ) : null}
                            </div>
                            <Link
                              href={href}
                              className="line-clamp-3 text-sm font-semibold leading-snug text-primary underline-offset-4 hover:underline"
                            >
                              {product.name}
                            </Link>
                            {variant?.options?.length ? (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {variantOptionSummary(variant)}
                              </p>
                            ) : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="[&_td]:align-middle [&_td]:border-t [&_td]:border-border [&_td]:py-3">
                  <tr>
                    <th scope="row" className={COMPARE_LABEL_COLUMN_CLASS}>
                      {labels.tableVariant}
                    </th>
                    {rows.map(({ line, variant }) => (
                      <td
                        key={`${line.productId}:${line.variantId ?? ""}-opt`}
                        className="border-l border-border px-3 text-center sm:text-left"
                      >
                        <span className="inline-block max-w-full break-words text-muted-foreground">
                          {variantOptionSummary(variant)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className={COMPARE_LABEL_COLUMN_CLASS}>
                      {labels.tableSku}
                    </th>
                    {rows.map(({ line, product, variant }) => (
                      <td
                        key={`${line.productId}:${line.variantId ?? ""}-sku`}
                        className="border-l border-border px-3 text-center sm:text-left"
                      >
                        <span className="inline-block max-w-full break-words">
                          {variant?.sku?.trim() || product.sku?.trim() || "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className={COMPARE_LABEL_COLUMN_CLASS}>
                      {labels.tablePrice}
                    </th>
                    {rows.map(({ line, product, variant }) => (
                      <td
                        key={`${line.productId}:${line.variantId ?? ""}-price`}
                        className="border-l border-border px-3"
                      >
                        <div className="flex justify-center sm:justify-start">
                          <PriceDisplay
                            price={variant?.price ?? product.basePrice}
                            compareAtPrice={variant?.compareAtPrice ?? product.compareAtPrice ?? null}
                            currency={product.currency}
                            productSaleDisplayMode={product.saleDisplayMode}
                            variantSaleDisplayMode={variant?.saleDisplayMode}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                  {features.multivendor ? (
                    <tr>
                      <th scope="row" className={COMPARE_LABEL_COLUMN_CLASS}>
                        {labels.tableVendor}
                      </th>
                      {rows.map(({ line, product }) => (
                        <td
                          key={`${line.productId}:${line.variantId ?? ""}-vendor`}
                          className="border-l border-border px-3 text-center sm:text-left"
                        >
                          {vendorLabel(product.tenant) ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ) : null}
                  <tr>
                    <th scope="row" className={`${COMPARE_LABEL_COLUMN_CLASS} align-top`}>
                      {labels.tableCategories}
                    </th>
                    {rows.map(({ line, product }) => (
                      <td
                        key={`${line.productId}:${line.variantId ?? ""}-cat`}
                        className="border-l border-border px-3 align-top"
                      >
                        <span className="inline-block max-w-full break-words text-muted-foreground">
                          {categorySummary(product.categories)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className={`${COMPARE_LABEL_COLUMN_CLASS} align-top`}>
                      {labels.tableSummary}
                    </th>
                    {rows.map(({ line, product }) => (
                      <td
                        key={`${line.productId}:${line.variantId ?? ""}-sum`}
                        className="border-l border-border px-3 align-top"
                      >
                        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-muted-foreground">
                          {product.shortDescription?.trim() || "—"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Technical Specifications Groups */}
                  {allComparedSpecs.groups.map((groupName) => {
                    const specItems = allComparedSpecs.specsByGroup[groupName] || [];
                    if (specItems.length === 0) return null;

                    return (
                      <tr key={`header-${groupName}`} className="bg-muted/60">
                        <th
                          colSpan={rows.length + 1}
                          className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {groupName}
                        </th>
                      </tr>
                    );
                  })}

                  {allComparedSpecs.groups.flatMap((groupName) => {
                    const specItems = allComparedSpecs.specsByGroup[groupName] || [];
                    return specItems.map((specMeta) => (
                      <tr key={specMeta.key} className="hover:bg-muted/20 transition-colors">
                        <th scope="row" className={COMPARE_LABEL_COLUMN_CLASS}>
                          {specMeta.label}
                        </th>
                        {rows.map(({ line, product }) => (
                          <td
                            key={`${line.productId}:${line.variantId ?? ""}-${specMeta.key}`}
                            className="border-l border-border px-3 align-middle"
                          >
                            <div className="text-sm">
                              {renderProductSpecValue(product, specMeta, locale)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
