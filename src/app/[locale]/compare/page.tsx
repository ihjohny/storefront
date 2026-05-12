import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComparePageClient } from "@/app/[locale]/compare/compare-page-client";
import { CompareLoadingSkeleton } from "@/app/[locale]/compare/compare-loading-skeleton";
import { features } from "@/lib/config/features";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

function CompareSkeleton({ title }: { title: string }) {
  return <CompareLoadingSkeleton columnCount={3} labels={{ pageTitle: title }} />;
}

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
    title: dict.catalog.compare.pageTitle,
    description: dict.catalog.compare.pageDescription,
    alternates: buildLocaleAlternates(locale as Locale, "/compare"),
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }
  if (!features.productCompareEnabled) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<CompareSkeleton title={dict.catalog.compare.pageTitle} />}>
        <ComparePageClient locale={locale} labels={dict.catalog.compare} />
      </Suspense>
    </main>
  );
}
