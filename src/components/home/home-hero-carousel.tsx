"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HomeHeroSlide } from "@/lib/cms/home-hero";
import { normalizeCmsPathToHref } from "@/lib/utils/normalize-cms-href";

const AUTOPLAY_MS = 8000;

const slideLayerClass =
  "absolute inset-0 flex flex-col transition-opacity duration-500 ease-in-out motion-reduce:transition-none motion-reduce:duration-0";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

type HomeHeroCarouselProps = {
  slides: HomeHeroSlide[];
  locale: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

export function HomeHeroCarousel({
  slides,
  locale,
  fallbackTitle,
  fallbackDescription,
}: HomeHeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      if (count <= 0) return;
      const m = ((next % count) + count) % count;
      setIndex(m);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [count]);

  if (count === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">{fallbackTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          {fallbackDescription}
        </p>
      </section>
    );
  }

  const titleClassName =
    "text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl md:text-4xl";

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
      aria-label={count > 1 ? "Featured banners" : "Featured banner"}
      {...(count > 1 ? { "aria-roledescription": "carousel" as const } : {})}
    >
      <div className="relative min-h-[280px] sm:min-h-[320px]">
        {slides.map((s, i) => {
          const isActive = i === index;
          return (
            <div
              key={s.id ?? `slide-${i}`}
              className={`${slideLayerClass} ${
                isActive
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              {s.backgroundImageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${s.backgroundImageUrl})` }}
                  aria-hidden
                />
              ) : null}
              <div
                className="absolute inset-0 bg-linear-to-b from-white/90 via-white/75 to-white/92 dark:from-slate-950/90 dark:via-slate-950/75 dark:to-slate-950/92"
                aria-hidden
              />
              <div className="relative z-10 flex min-h-[280px] flex-col justify-center px-10 py-10 sm:min-h-[320px] sm:px-14 sm:py-12 md:px-16">
                <div className="mx-auto max-w-3xl text-center">
                  {s.heading ? (
                    isActive ? (
                      <h1 className={titleClassName}>{s.heading}</h1>
                    ) : (
                      <div className={titleClassName}>{s.heading}</div>
                    )
                  ) : null}
                  {s.subheading ? (
                    <p className="mt-3 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                      {s.subheading}
                    </p>
                  ) : null}
                  {s.ctaLabel && s.ctaUrl ? (
                    <div className="mt-6">
                      <Link
                        href={normalizeCmsPathToHref(s.ctaUrl, locale)}
                        className="inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                        {s.ctaLabel}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900 sm:left-3 sm:h-11 sm:w-11"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900 sm:right-3 sm:h-11 sm:w-11"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div
              className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-5"
              role="tablist"
              aria-label="Slide indicators"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id ?? `dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1} of ${count}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition ${
                    i === index ? "w-6 bg-primary" : "w-2 bg-slate-400/60 hover:bg-slate-400 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
