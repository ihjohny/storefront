"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/url";
import type { Media } from "@/lib/types/product";

type ProductGalleryProps = {
  images: Media[];
  fallbackAlt: string;
};

export function ProductGallery({ images, fallbackAlt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = useMemo(() => images.filter((image) => Boolean(image?.url)), [images]);
  const activeImage = safeImages[activeIndex];
  const activeUrl = getMediaUrl(activeImage?.url);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt={activeImage?.alt || fallbackAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((image, index) => {
            const thumbUrl = getMediaUrl(image.url);
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-md border ${
                  index === activeIndex
                    ? "border-slate-900 dark:border-slate-100"
                    : "border-slate-300 dark:border-slate-700"
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={image.alt || fallbackAlt}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
