import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { getMediaUrl } from "@/lib/utils/url";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/shared/pagination";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
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
  const storeId = await getSelectedStoreId();
  const page = Math.max(1, toNumber(firstParam(query.page)) ?? 1);
  const sort = firstParam(query.sort) ?? "-createdAt";

  const products = await getProducts({
    category: category.id,
    locale,
    sort,
    page,
    storeId,
  });

  const categoryImageUrl =
    category.image && typeof category.image === "object"
      ? getMediaUrl(category.image.url)
      : null;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <CategoryBreadcrumb locale={locale} category={category} />
      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-[160px_1fr] sm:p-6">
        <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
          {categoryImageUrl ? (
            <Image
              src={categoryImageUrl}
              alt={category.image?.alt || category.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">{category.name}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Products in this category.
          </p>
        </div>
      </section>

      <ProductGrid products={products.docs} locale={locale} />
      <Pagination
        currentPage={products.page}
        totalPages={products.totalPages}
        pathname={`/${locale}/categories/${slug}`}
        query={{ sort }}
      />
    </main>
  );
}
