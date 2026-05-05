import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTopLevelCategories } from "@/lib/api/categories";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getMediaUrl } from "@/lib/utils/url";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
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
    title: dict.catalog.seo.categoriesTitle,
    description: dict.catalog.seo.categoriesDescription,
    alternates: buildLocaleAlternates(locale as Locale, "/categories"),
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const categories = await getTopLevelCategories(locale);
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{dict.catalog.categoriesTitle}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {dict.catalog.categoriesDescription}
        </p>
      </header>

      {categories.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {dict.catalog.categoriesEmpty}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-sm"
            >
              <div className="relative aspect-3/2 bg-muted">
                {category.image ? (
                  <Image
                    src={getMediaUrl(category.image.url) ?? ""}
                    alt={category.image.alt || category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h2 className="text-base font-semibold text-card-foreground sm:text-lg">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{dict.catalog.categoryExplore}</p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
