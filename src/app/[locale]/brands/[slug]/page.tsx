import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrandBySlug, getAttributes } from "@/lib/api/attributes";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { getMediaUrl } from "@/lib/utils/url";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { ActiveFilterPills } from "@/components/catalog/active-filter-pills";
import { Pagination } from "@/components/shared/pagination";
import { features } from "@/lib/config/features";
import { resolveListingStoreId } from "@/lib/utils/listing-store-id";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }
  const brand = await getBrandBySlug(slug, locale);
  if (!brand) {
    return {};
  }
  const path = `/brands/${slug}`;
  return {
    title: `${brand.label} Products — Official Brand Catalog`,
    description: brand.description || `Browse the official collection of ${brand.label} products. Authentic gear, warranty-backed and fast delivery.`,
    alternates: buildLocaleAlternates(locale as Locale, path),
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { locale, slug } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const brand = await getBrandBySlug(slug, locale);
  if (!brand) {
    notFound();
  }

  const query = await searchParams;
  const cookieStoreId = await getSelectedStoreId();
  const inStockAtStoreParam = firstParam(query.inStockAtStore);
  const listingStoreId = resolveListingStoreId({
    serviceAreaStoreSelection: features.serviceAreaStoreSelection,
    selectedStockLocationId: cookieStoreId,
    inStockAtStoreParam,
  });

  const page = Math.max(1, toNumber(firstParam(query.page)) ?? 1);
  const sort = firstParam(query.sort) ?? "-createdAt";
  const category = firstParam(query.category);
  const attributesParam = firstParam(query.attributes);
  const minPrice = toNumber(firstParam(query.minPrice));
  const maxPrice = toNumber(firstParam(query.maxPrice));
  const featured = firstParam(query.featured) === "1";

  const [products, categories, attributes, dict] = await Promise.all([
    getProducts({
      brand: brand.id,
      category,
      attributes: attributesParam,
      minPrice,
      maxPrice,
      featured,
      locale,
      sort,
      page,
      storeId: listingStoreId,
    }),
    getCategories(locale),
    getAttributes({ locale }),
    getDictionary(locale as Locale),
  ]);

  const logoUrl =
    brand.logo && typeof brand.logo === "object" ? getMediaUrl(brand.logo.url) : null;

  const showStockToggle =
    features.serviceAreaStoreSelection && Boolean(cookieStoreId);
  const listingUsedStoreFilter = Boolean(listingStoreId);
  const availabilityBadgeLabel =
    features.productCardStockBadgesOnCards && listingUsedStoreFilter
      ? dict.catalog.availableAtLocationBadge
      : null;

  const paginationQuery = {
    sort,
    category,
    attributes: attributesParam,
    minPrice: minPrice ? String(minPrice) : undefined,
    maxPrice: maxPrice ? String(maxPrice) : undefined,
    featured: featured ? "1" : undefined,
    inStockAtStore: inStockAtStoreParam === "0" ? "0" : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={`/${locale}`} className="transition hover:text-foreground">
          {dict.common.home}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/brands`} className="transition hover:text-foreground">
          Brands
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{brand.label}</span>
      </nav>

      {/* Brand Hero Banner */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 font-bold text-2xl text-primary shadow-xs">
              {logoUrl ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <Image src={logoUrl} alt={brand.label} fill className="object-contain" sizes="48px" priority />
                </div>
              ) : (
                brand.label.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {brand.label}
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Official Brand
                </span>
              </div>
              {brand.description ? (
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {brand.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* External website / brand meta */}
          {brand.website ? (
            <div className="shrink-0">
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                <span>Visit Official Site</span>
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-muted-foreground" fill="currentColor">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06 1.06L15 6.06v3.69a.75.75 0 0 0 1.5 0V4.25a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0 0 1.5h3.69l-7.746 7.753Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          ) : null}
        </div>

        {/* Dynamic Brand Properties Pill Bar */}
        {brand.properties && brand.properties.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            {brand.properties.map((prop, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <strong className="font-medium text-foreground capitalize">
                  {prop.propertyKey.replace(/([A-Z])/g, " $1")}:
                </strong>{" "}
                <span>{prop.propertyValue}</span>
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {/* Two-column Layout: Category/Price/Specs Sidebar + Brand Products Grid */}
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="order-2 space-y-5 lg:order-2">
          <ActiveFilterPills
            categories={categories}
            attributes={attributes}
          />

          <ProductGrid
            products={products.docs}
            locale={locale}
            emptyMessage={`No ${brand.label} products found matching your current filter selection.`}
            availabilityBadgeLabel={availabilityBadgeLabel}
            quickViewCopy={dict.catalog.quickView}
            quickViewGalleryLabels={dict.product.gallery}
            quickViewProductDetailsTitle={dict.product.productDetails}
            quickViewProductDetailsSeeLess={dict.product.descriptionSeeLess}
            compareLabels={dict.catalog.compare}
          />

          <Pagination
            currentPage={products.page}
            totalPages={products.totalPages}
            pathname={`/${locale}/brands/${slug}`}
            query={paginationQuery}
          />
        </div>

        <div className="order-1 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ProductFilters
            categories={categories}
            attributes={attributes}
            hideBrandFilter
            inStockLocationToggleEnabled={showStockToggle}
            inStockLocationLabel={dict.catalog.inStockAtLocationLabel}
            inStockLocationHint={dict.catalog.inStockAtLocationHint}
          />
        </div>
      </section>
    </main>
  );
}
