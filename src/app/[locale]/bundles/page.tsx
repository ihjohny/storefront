import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import { emptyProductListingResponse } from "@/lib/utils/empty-product-listing";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/shared/pagination";
import type { ProductsResponse } from "@/lib/types/product";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type BundlesPageProps = {
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
    title: dict.catalog.seo.bundlesTitle,
    description: dict.catalog.seo.bundlesDescription,
    alternates: buildLocaleAlternates(locale as Locale, "/bundles"),
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

export default async function BundlesPage({
  params,
  searchParams,
}: BundlesPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const query = await searchParams;
  const page = Math.max(1, toNumber(firstParam(query.page)) ?? 1);
  const filters = {
    locale,
    page,
    search: firstParam(query.search),
    sort: firstParam(query.sort) ?? "-createdAt",
    featured: firstParam(query.featured) === "1",
    productType: "bundle" as const,
  };

  let productsResponse: ProductsResponse = emptyProductListingResponse(page);
  let catalogError: string | null = null;

  try {
    productsResponse = await getProducts(filters);
  } catch (err) {
    if (err instanceof ApiError) {
      catalogError =
        err.status >= 500
          ? "Bundles are temporarily unavailable. Please try again in a few moments."
          : "We couldn’t load bundles right now. Refresh the page or try again shortly.";
    } else {
      catalogError = "We couldn’t load bundles. Check your connection and try again.";
    }
  }

  const dict = await getDictionary(locale as Locale);
  const paginationQuery = {
    search: filters.search,
    sort: filters.sort,
    featured: filters.featured ? "1" : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{dict.catalog.bundlesTitle}</h1>
        <p className="text-sm text-muted-foreground">{dict.catalog.bundlesDescription}</p>
      </header>

      {catalogError ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          {catalogError}
        </div>
      ) : null}

      <section className="space-y-5">
        <ProductGrid
          products={productsResponse.docs}
          locale={locale}
          productHrefBase="bundles"
          emptyMessage={dict.catalog.noBundlesFiltered}
          quickViewCopy={dict.catalog.quickView}
          quickViewGalleryLabels={dict.product.gallery}
          quickViewProductDetailsTitle={dict.product.productDetails}
          quickViewProductDetailsSeeLess={dict.product.descriptionSeeLess}
          compareLabels={dict.catalog.compare}
        />
        <Pagination
          currentPage={productsResponse.page}
          totalPages={productsResponse.totalPages}
          pathname={`/${locale}/bundles`}
          query={paginationQuery}
        />
      </section>
    </main>
  );
}
