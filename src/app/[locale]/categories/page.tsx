import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopLevelCategories } from "@/lib/api/categories";
import { i18nConfig, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const categories = await getTopLevelCategories(locale);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Categories</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Browse top-level product categories.
        </p>
      </header>

      {categories.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          No categories available right now.
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <h2 className="text-base font-semibold sm:text-lg">{category.name}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Explore products in this category.
              </p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
