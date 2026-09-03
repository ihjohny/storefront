import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { getBrands, getAttributes } from "@/lib/api/attributes";
import { getMediaUrl } from "@/lib/utils/url";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { ActiveFilterPills } from "@/components/catalog/active-filter-pills";
import { Pagination } from "@/components/shared/pagination";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { features } from "@/lib/config/features";
import { resolveListingStoreId } from "@/lib/utils/listing-store-id";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
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
  const category = await getCategoryBySlug(slug, locale);
  if (!category) {
    return {};
  }
  const dict = await getDictionary(locale as Locale);
  const path = `/categories/${slug}`;
  return {
    title: category.meta?.title || category.name,
    description: category.meta?.description || dict.catalog.categoryProductsSubtitle,
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug, locale);
  if (!category) {
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
  const brand = firstParam(query.brand);
  const attributesParam = firstParam(query.attributes);
  const minPrice = toNumber(firstParam(query.minPrice));
  const maxPrice = toNumber(firstParam(query.maxPrice));
  const featured = firstParam(query.featured) === "1";

  const [products, brands, attributes, dict] = await Promise.all([
    getProducts({
      category: category.id,
      brand,
      attributes: attributesParam,
      minPrice,
      maxPrice,
      featured,
      locale,
      sort,
      page,
      storeId: listingStoreId,
    }),
    getBrands(locale),
    getAttributes({ locale }),
    getDictionary(locale as Locale),
  ]);

  const categoryImageUrl =
    category.image && typeof category.image === "object"
      ? getMediaUrl(category.image.url)
      : null;

  const showStockToggle =
    features.serviceAreaStoreSelection && Boolean(cookieStoreId);
  const listingUsedStoreFilter = Boolean(listingStoreId);
  const availabilityBadgeLabel =
    features.productCardStockBadgesOnCards && listingUsedStoreFilter
      ? dict.catalog.availableAtLocationBadge
      : null;

  const paginationQuery = {
    sort,
    brand,
    attributes: attributesParam,
    minPrice: minPrice ? String(minPrice) : undefined,
    maxPrice: maxPrice ? String(maxPrice) : undefined,
    featured: featured ? "1" : undefined,
    inStockAtStore: inStockAtStoreParam === "0" ? "0" : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <CategoryBreadcrumb locale={locale} category={category} />

      {/* Category Hero Banner */}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-card p-4 shadow-xs dark:border-slate-800 sm:grid-cols-[160px_1fr] sm:p-6">
        <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
          {categoryImageUrl ? (
            <Image
              src={categoryImageUrl}
              alt={category.image?.alt || category.name}
              fill
              className="object-cover"
              sizes="160px"
              priority
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.catalog.categoryProductsSubtitle} · {products.totalDocs} products available
          </p>
        </div>
      </section>

      {/* Two-column Layout: Sidebar Filters + Products Grid */}
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="order-2 space-y-5 lg:order-2">
          <ActiveFilterPills
            brands={brands}
            attributes={attributes}
          />

          <ProductGrid
            products={products.docs}
            locale={locale}
            emptyMessage={dict.catalog.noProductsFiltered}
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
            pathname={`/${locale}/categories/${slug}`}
            query={paginationQuery}
          />
        </div>

        <div className="order-1 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ProductFilters
            brands={brands}
            attributes={attributes}
            hideCategoryFilter
            inStockLocationToggleEnabled={showStockToggle}
            inStockLocationLabel={dict.catalog.inStockAtLocationLabel}
            inStockLocationHint={dict.catalog.inStockAtLocationHint}
          />
        </div>
      </section>
    </main>
  );
}
