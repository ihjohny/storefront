import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import { emptyProductListingResponse } from "@/lib/utils/empty-product-listing";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/shared/pagination";
import type { Category } from "@/lib/types/category";
import type { ProductsResponse } from "@/lib/types/product";
import { features } from "@/lib/config/features";
import { resolveListingStoreId } from "@/lib/utils/listing-store-id";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.catalog.seo.productsTitle,
    description: dict.catalog.seo.productsDescription,
    alternates: buildLocaleAlternates(locale as Locale, "/products"),
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

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
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
  const filters = {
    locale,
    page,
    category: firstParam(query.category),
    search: firstParam(query.search),
    sort: firstParam(query.sort) ?? "-createdAt",
    minPrice: toNumber(firstParam(query.minPrice)),
    maxPrice: toNumber(firstParam(query.maxPrice)),
    featured: firstParam(query.featured) === "1",
    storeId: listingStoreId,
  };

  let productsResponse: ProductsResponse = emptyProductListingResponse(page);
  let categories: Category[] = [];
  let catalogError: string | null = null;

  try {
    const [products, cats] = await Promise.all([
      getProducts(filters),
      getCategories(locale),
    ]);
    productsResponse = products;
    categories = cats;
  } catch (err) {
    if (err instanceof ApiError) {
      catalogError =
        err.status >= 500
          ? "The product catalog is temporarily unavailable. Please try again in a few moments."
          : "We couldn’t load products right now. Refresh the page or try again shortly.";
    } else {
      catalogError = "We couldn’t load products. Check your connection and try again.";
    }
  }

  const dict = await getDictionary(locale as Locale);
  const paginationQuery = {
    category: filters.category,
    search: filters.search,
    sort: filters.sort,
    minPrice: filters.minPrice ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? String(filters.maxPrice) : undefined,
    featured: filters.featured ? "1" : undefined,
    inStockAtStore: inStockAtStoreParam === "0" ? "0" : undefined,
  };

  const showStockToggle =
    features.serviceAreaStoreSelection && Boolean(cookieStoreId);
  const listingUsedStoreFilter = Boolean(listingStoreId);
  const availabilityBadgeLabel =
    features.productCardStockBadgesOnCards && listingUsedStoreFilter
      ? dict.catalog.availableAtLocationBadge
      : null;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{dict.catalog.productsTitle}</h1>
        <p className="text-sm text-muted-foreground">{dict.catalog.productsDescription}</p>
      </header>

      {catalogError ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          {catalogError}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="order-2 space-y-5 lg:order-2">
          <ProductGrid
            products={productsResponse.docs}
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
            currentPage={productsResponse.page}
            totalPages={productsResponse.totalPages}
            pathname={`/${locale}/products`}
            query={paginationQuery}
          />
        </div>
        <div className="order-1 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ProductFilters
            categories={categories}
            inStockLocationToggleEnabled={showStockToggle}
            inStockLocationLabel={dict.catalog.inStockAtLocationLabel}
            inStockLocationHint={dict.catalog.inStockAtLocationHint}
          />
        </div>
      </section>
    </main>
  );
}
