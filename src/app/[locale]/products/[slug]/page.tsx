import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductVariants } from "@/lib/api/products";
import { getMediaUrl } from "@/lib/utils/url";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { ProductDetail } from "@/components/product/product-detail";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }

  const product = await getProductBySlug(slug, locale);
  if (!product) {
    return {};
  }

  const firstImageUrl = product.images[0]?.url
    ? getMediaUrl(product.images[0].url)
    : null;

  return {
    title: product.meta?.title || product.name,
    description: product.meta?.description || product.shortDescription || undefined,
    openGraph: {
      images: firstImageUrl ? [{ url: firstImageUrl }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const product = await getProductBySlug(slug, locale);
  if (!product) {
    notFound();
  }

  const variants = product.hasVariants ? await getProductVariants(product.id) : [];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetail product={product} variants={variants} locale={locale} />
    </main>
  );
}
