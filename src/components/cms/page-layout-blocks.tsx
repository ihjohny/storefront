"use client";

import Link from "next/link";
import { CmsRichText } from "@/components/cms/cms-rich-text";
import type { CmsLayoutBlock } from "@/lib/types/cms-page";
import { getMediaUrl } from "@/lib/utils/url";
import { toVideoEmbedSrc } from "@/lib/utils/video-embed-url";

function mediaFromBlock(value: unknown): { url: string | null; alt: string } {
  if (!value || typeof value !== "object") {
    return { url: null, alt: "" };
  }
  const o = value as { url?: string; alt?: string | null };
  return {
    url: getMediaUrl(o.url ?? null),
    alt: typeof o.alt === "string" ? o.alt : "",
  };
}

type PageLayoutBlocksProps = {
  blocks: CmsLayoutBlock[];
};

export function PageLayoutBlocks({ blocks }: PageLayoutBlocksProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      {blocks.map((block, index) => {
        const key = typeof block.id === "string" ? block.id : `block-${index}`;
        const type = block.blockType;

        if (type === "richText") {
          return (
            <div key={key} className="prose prose-neutral max-w-none dark:prose-invert">
              <CmsRichText data={block.content} />
            </div>
          );
        }

        if (type === "hero") {
          const bg = mediaFromBlock(block.backgroundImage);
          const heading = typeof block.heading === "string" ? block.heading : "";
          const sub =
            typeof block.subheading === "string" ? block.subheading : "";
          const ctaLabel = typeof block.ctaLabel === "string" ? block.ctaLabel : "";
          const ctaUrl = typeof block.ctaUrl === "string" ? block.ctaUrl.trim() : "";

          return (
            <section
              key={key}
              className="relative overflow-hidden rounded-2xl border border-border bg-muted/40 px-5 py-10 sm:px-8 sm:py-12"
            >
              {bg.url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${bg.url})` }}
                  aria-hidden
                />
              ) : null}
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                {heading ? (
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {heading}
                  </h2>
                ) : null}
                {sub ? (
                  <p className="mt-3 text-lg text-muted-foreground">{sub}</p>
                ) : null}
                {ctaLabel && ctaUrl ? (
                  <div className="mt-6">
                    <Link
                      href={ctaUrl}
                      className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                ) : null}
              </div>
            </section>
          );
        }

        if (type === "image") {
          const { url, alt } = mediaFromBlock(block.image);
          const caption = typeof block.caption === "string" ? block.caption : "";
          const variant = block.variant === "full" ? "full" : "rounded";
          if (!url) {
            return null;
          }
          return (
            <figure
              key={key}
              className={variant === "full" ? "mx-[calc(50%-50vw)] w-screen max-w-none sm:mx-0 sm:w-auto" : ""}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={alt || caption || ""}
                className={
                  variant === "full"
                    ? "h-auto w-full object-cover"
                    : "max-h-[480px] w-full rounded-xl object-cover"
                }
              />
              {caption ? (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (type === "splitSection") {
          const { url, alt } = mediaFromBlock(block.image);
          const position = block.imagePosition === "right" ? "right" : "left";
          const body = block.body;

          return (
            <div
              key={key}
              className={`flex flex-col gap-8 md:flex-row md:items-center ${
                position === "right" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30 md:w-1/2">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={alt} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="prose prose-neutral max-w-none md:w-1/2 dark:prose-invert">
                <CmsRichText data={body} />
              </div>
            </div>
          );
        }

        if (type === "videoEmbed") {
          const title = typeof block.title === "string" ? block.title : "";
          const embedUrl =
            typeof block.embedUrl === "string" ? toVideoEmbedSrc(block.embedUrl) : null;
          const raw =
            typeof block.embedUrl === "string" ? block.embedUrl.trim() : "";

          return (
            <div key={key} className="space-y-3">
              {title ? (
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              ) : null}
              {embedUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <iframe
                    title={title || "Video"}
                    src={embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : raw ? (
                <p className="text-sm text-muted-foreground">
                  Unsupported video URL.{" "}
                  <a href={raw} className="text-primary underline">
                    Open link
                  </a>
                </p>
              ) : null}
            </div>
          );
        }

        if (type === "faq") {
          const heading = typeof block.heading === "string" ? block.heading : "";
          const items = Array.isArray(block.items) ? block.items : [];

          return (
            <section key={key} className="space-y-4">
              {heading ? (
                <h3 className="text-xl font-semibold text-foreground">{heading}</h3>
              ) : null}
              <dl className="divide-y divide-border rounded-xl border border-border">
                {items.map((item, i) => {
                  if (!item || typeof item !== "object") {
                    return null;
                  }
                  const row = item as { question?: string; answer?: unknown };
                  const q = typeof row.question === "string" ? row.question : "";
                  return (
                    <div key={i} className="px-4 py-4 sm:px-5">
                      <dt className="font-medium text-foreground">{q}</dt>
                      <dd className="mt-2 prose prose-neutral max-w-none text-muted-foreground dark:prose-invert">
                        <CmsRichText data={row.answer} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );
        }

        if (type === "callout") {
          const tone = block.tone === "primary" || block.tone === "warning" ? block.tone : "muted";
          const toneClass =
            tone === "primary"
              ? "border-primary/30 bg-primary/5"
              : tone === "warning"
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-border bg-muted/40";

          return (
            <div
              key={key}
              className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${toneClass}`}
            >
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <CmsRichText data={block.content} />
              </div>
            </div>
          );
        }

        if (type === "spacer") {
          const size = block.size === "sm" || block.size === "lg" ? block.size : "md";
          const h = size === "sm" ? "h-8" : size === "lg" ? "h-24" : "h-14";
          return <div key={key} className={h} aria-hidden />;
        }

        return null;
      })}
    </div>
  );
}
