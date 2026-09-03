import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrands } from "@/lib/api/attributes";
import { getMediaUrl } from "@/lib/utils/url";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildLocaleAlternates } from "@/lib/seo/locale-metadata";

export const dynamic = "force-dynamic";

type BrandsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BrandsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    return {};
  }
  return {
    title: "Brands Directory — Discover Top Manufacturers & Brands",
    description: "Explore our curated collection of leading brands, manufacturers, and verified product lines.",
    alternates: buildLocaleAlternates(locale as Locale, "/brands"),
  };
}

export default async function BrandsPage({ params }: BrandsPageProps) {
  const { locale } = await params;
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const [brands, dict] = await Promise.all([
    getBrands(locale),
    getDictionary(locale as Locale),
  ]);

  const featuredBrands = brands.filter((b) => b.featured);

  // Group brands alphabetically
  const groupedBrands = brands.reduce<Record<string, typeof brands>>((acc, brand) => {
    const letter = (brand.label[0] || "#").toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedBrands).sort();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/${locale}`} className="transition hover:text-foreground">
            {dict.common.home}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Brands</span>
        </nav>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Brands & Manufacturers
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Discover authentic products from the world&apos;s most trusted manufacturers and brands.
          </p>
        </div>
      </div>

      {/* Featured Brands Spotlight */}
      {featuredBrands.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Featured Brands
            </h2>
            <span className="text-xs text-muted-foreground">
              {featuredBrands.length} featured partners
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBrands.map((brand) => {
              const logoUrl =
                brand.logo && typeof brand.logo === "object" ? getMediaUrl(brand.logo.url) : null;
              const origin = brand.properties?.find((p) => p.propertyKey === "originCountry")?.propertyValue;

              return (
                <Link
                  key={brand.id}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/40 font-semibold text-lg text-primary shadow-xs">
                        {logoUrl ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            <Image src={logoUrl} alt={brand.label} fill className="object-contain" sizes="40px" />
                          </div>
                        ) : (
                          brand.label.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        Verified
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                        {brand.label}
                      </h3>
                      {brand.description ? (
                        <p className="line-clamp-2 mt-1 text-xs text-muted-foreground">
                          {brand.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    {origin ? <span>{origin}</span> : <span>Explore Catalog</span>}
                    <span className="font-medium text-primary group-hover:underline">View Products →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Alphabetical Brands Directory */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            All Brands Directory (A-Z)
          </h2>
          {/* Quick jump letters */}
          <div className="flex flex-wrap gap-1">
            {sortedLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {sortedLetters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24 space-y-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                {letter}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groupedBrands[letter].map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/${locale}/brands/${brand.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-2xs transition hover:bg-muted/40 hover:border-border/80"
                  >
                    <span className="font-medium text-sm text-foreground">{brand.label}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
