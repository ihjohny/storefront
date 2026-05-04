import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";
import { getProducts } from "@/lib/api/products";
import { features } from "@/lib/config/features";
import { PriceDisplay } from "@/components/shared/price-display";
import { getMediaUrl } from "@/lib/utils/url";
import { getProductMedia } from "@/lib/utils/product-media";
import type { SaleDisplayMode } from "@/lib/utils/sale-presentation";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";
import type { PaginatedResponse } from "@/lib/types/api-response";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { getHomeHeroSlides } from "@/lib/cms/home-hero";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.catalog.seo.homeTitle,
    description: dict.catalog.seo.homeDescription,
    alternates: buildLocaleAlternates(locale as Locale, ""),
  };
}

type Media = {
  url?: string;
  alt?: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  basePrice?: number;
  compareAtPrice?: number | null;
  currency?: string;
  saleDisplayMode?: SaleDisplayMode;
  images?: Array<Media | string> | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: Media | string | null;
};

type VendorProfile = {
  id: string;
  displayName?: string;
  slug?: string;
  logo?: Media | string | null;
};

async function getFeaturedProducts(
  locale: Locale,
  storeId?: string,
): Promise<Product[]> {
  try {
    const response = await getProducts({
      featured: true,
      limit: 4,
      locale,
      storeId,
    });
    return (response.docs as unknown as Product[]) ?? [];
  } catch {
    return [];
  }
}

async function getRootCategories(locale: Locale): Promise<Category[]> {
  try {
    const response = await apiClient<PaginatedResponse<Category>>(
      `/categories?where[parent][exists]=false&locale=${locale}&limit=8&depth=1`,
      { next: { revalidate: 60 } as never },
    );
    return response.docs ?? [];
  } catch {
    return [];
  }
}

async function getTopVendors(): Promise<VendorProfile[]> {
  if (!features.multivendor) {
    return [];
  }

  try {
    const response = await apiClient<PaginatedResponse<VendorProfile>>(
      "/vendor-profiles?depth=1&limit=4",
      { next: { revalidate: 120 } as never },
    );
    return response.docs ?? [];
  } catch {
    return [];
  }
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const safeLocale = locale as Locale;
  const storeId = await getSelectedStoreId();
  const dict = await getDictionary(safeLocale);
  const [featuredProducts, categories, vendors, homeHeroSlides] = await Promise.all([
    getFeaturedProducts(safeLocale, storeId),
    getRootCategories(safeLocale),
    getTopVendors(),
    getHomeHeroSlides(safeLocale),
  ]);
  // Announcement bar is shown once in <Header> (layout); do not duplicate it below the hero.

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <HomeHeroCarousel
        slides={homeHeroSlides}
        locale={locale}
        fallbackTitle={dict.common.home}
        fallbackDescription="Mobile-first storefront foundation is live. Featured products and top categories are loaded from backend APIs."
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">Featured Products</h2>
          <Link
            href={`/${locale}/products`}
            className="text-sm text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {dict.common.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const firstImage = getProductMedia(product.images as Parameters<typeof getProductMedia>[0])[0];
              const mediaUrl = getMediaUrl(firstImage?.url);
              const price = Number(product.basePrice ?? 0);
              const currency = product.currency ?? "USD";

              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-900">
                    {mediaUrl ? (
                      <Image
                        src={mediaUrl}
                        alt={firstImage?.alt ? firstImage.alt : product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-1 p-4">
                    <h3 className="line-clamp-2 text-sm font-medium sm:text-base">
                      {product.name}
                    </h3>
                    <PriceDisplay
                      price={price}
                      compareAtPrice={product.compareAtPrice ?? null}
                      currency={currency}
                      productSaleDisplayMode={product.saleDisplayMode}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold sm:text-xl">Top Categories</h2>
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {dict.common.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const mediaUrl = getMediaUrl(
                typeof category.image === "object" ? category.image?.url : null,
              );
              return (
                <Link
                  key={category.id}
                  href={`/${locale}/categories/${category.slug}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative aspect-3/2 bg-slate-100 dark:bg-slate-900">
                    {mediaUrl ? (
                      <Image
                        src={mediaUrl}
                        alt={
                          typeof category.image === "object" && category.image?.alt
                            ? category.image.alt
                            : category.name
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium sm:text-base">{category.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {features.multivendor ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold sm:text-xl">Top Vendors</h2>
          {vendors.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {dict.common.noResults}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {vendors.map((vendor) => {
                const logoUrl = getMediaUrl(
                  typeof vendor.logo === "object" ? vendor.logo?.url : null,
                );
                return (
                  <Link
                    key={vendor.id}
                    href={`/${locale}/vendors/${vendor.slug || vendor.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={vendor.displayName || "Vendor logo"}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <p className="text-sm font-medium">
                      {vendor.displayName || "Vendor"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white dark:border-slate-700 sm:p-8">
        <h2 className="text-xl font-semibold sm:text-2xl">Seasonal Promotion</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
          Discover new arrivals and exclusive offers curated for a fast and smooth shopping
          experience on all devices.
        </p>
        <Link
          href={`/${locale}/products`}
          className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
        >
          Explore Products
        </Link>
      </section>
    </main>
  );
}
