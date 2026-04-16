import { notFound } from "next/navigation";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/shared/pagination";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const storeId = await getSelectedStoreId();
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
    storeId,
  };

  const [productsResponse, categories] = await Promise.all([
    getProducts(filters),
    getCategories(locale),
  ]);

  const paginationQuery = {
    category: filters.category,
    search: filters.search,
    sort: filters.sort,
    minPrice: filters.minPrice ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? String(filters.maxPrice) : undefined,
    featured: filters.featured ? "1" : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Products</h1>
        <p className="text-sm text-muted-foreground">
          Browse published products with category, sort, and price filters.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="order-2 space-y-5 lg:order-2">
          <ProductGrid products={productsResponse.docs} locale={locale} />
          <Pagination
            currentPage={productsResponse.page}
            totalPages={productsResponse.totalPages}
            pathname={`/${locale}/products`}
            query={paginationQuery}
          />
        </div>
        <div className="order-1 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ProductFilters categories={categories} />
        </div>
      </section>
    </main>
  );
}
