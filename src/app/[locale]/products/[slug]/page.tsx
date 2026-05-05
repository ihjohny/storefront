import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductVariants } from "@/lib/api/products";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductMedia } from "@/lib/utils/product-media";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductDetail } from "@/components/product/product-detail";
import type { CheckoutShippingCopy } from "@/lib/types/checkout-copy";
import { RelatedProductsSection } from "@/components/product/related-products-section";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

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

  const firstImage = getProductMedia(product.images)[0];
  const firstImageUrl = firstImage?.url ? getMediaUrl(firstImage.url) : null;
  const path = `/products/${product.slug}`;
  const alternates = buildLocaleAlternates(locale as Locale, path);
  const canonical =
    typeof alternates.canonical === "string" ? alternates.canonical : undefined;

  return {
    title: product.meta?.title || product.name,
    description: product.meta?.description || product.shortDescription || undefined,
    alternates,
    openGraph: {
      url: canonical,
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
  const dict = await getDictionary(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetail
        product={product}
        variants={variants}
        locale={locale}
        productDetailsTitle={dict.product.productDetails}
        deliveryOptionsTitle={dict.product.deliveryOptions}
        deliveryOptionsLoading={dict.product.deliveryOptionsLoading}
        deliveryOptionsFootnote={dict.product.deliveryOptionsFootnote}
        shippingMethodCopy={dict.checkout.shipping as CheckoutShippingCopy}
      />
      <RelatedProductsSection
        locale={locale}
        currentProductId={product.id}
        product={product}
        title={dict.product.relatedProducts}
      />
    </main>
  );
}
