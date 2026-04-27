import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayoutBlocks } from "@/components/cms/page-layout-blocks";
import { getPageBySlug } from "@/lib/api/pages";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getMediaUrl } from "@/lib/utils/url";

type CmsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug, locale);
  if (!page) {
    return { title: "Not found" };
  }

  const meta = page.meta;
  const title = (meta?.title?.trim() || page.title).trim();
  const description = meta?.description?.trim() || undefined;
  const image =
    meta?.image && typeof meta.image === "object" && meta.image !== null
      ? getMediaUrl(meta.image.url)
      : null;

  return {
    title,
    description,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function CmsPageRoute({ params }: CmsPageProps) {
  const { locale, slug } = await params;

  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const page = await getPageBySlug(slug, locale);
  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {page.title}
        </h1>
      </header>
      {page.layout && page.layout.length > 0 ? (
        <PageLayoutBlocks blocks={page.layout} />
      ) : null}
    </article>
  );
}
