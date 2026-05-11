"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { features } from "@/lib/config/features";
import { getMediaUrl } from "@/lib/utils/url";
import type { Media } from "@/lib/types/product";

export type ProductGalleryLabels = {
  dialogTitle: string;
  openPreview: string;
  closePreview: string;
  previousImage: string;
  nextImage: string;
};

type ProductGalleryProps = {
  images: Media[];
  fallbackAlt: string;
  labels: ProductGalleryLabels;
  /** e.g. sale badge overlay; keep in sync with selected variant in parent when needed */
  overlay?: ReactNode;
  /** Controlled selection (variant PDP); omit for internal state */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
};

export function ProductGallery({
  images,
  fallbackAlt,
  labels,
  overlay,
  activeIndex: controlledIndex,
  onActiveIndexChange,
}: ProductGalleryProps) {
  const safeImages = useMemo(() => images.filter((image) => Boolean(image?.url)), [images]);
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled =
    typeof controlledIndex === "number" && typeof onActiveIndexChange === "function";

  const committedIndex = isControlled ? controlledIndex! : internalIndex;

  const setCommittedIndex = useCallback(
    (next: number) => {
      const bounded =
        safeImages.length === 0 ? 0 : Math.max(0, Math.min(next, safeImages.length - 1));
      if (isControlled) {
        onActiveIndexChange!(bounded);
      } else {
        setInternalIndex(bounded);
      }
    },
    [isControlled, onActiveIndexChange, safeImages.length],
  );

  const [hoverPreviewIndex, setHoverPreviewIndex] = useState<number | null>(null);
  const displayIndex =
    hoverPreviewIndex !== null ? hoverPreviewIndex : committedIndex;

  const activeImage = safeImages[displayIndex];
  const activeUrl = getMediaUrl(activeImage?.url);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxUrl = getMediaUrl(safeImages[lightboxIndex]?.url);

  const openLightbox = useCallback(() => {
    setLightboxIndex(displayIndex);
    setLightboxOpen(true);
  }, [displayIndex]);

  const shiftLightbox = useCallback(
    (delta: number) => {
      if (safeImages.length === 0) return;
      const next =
        (lightboxIndex + delta + safeImages.length) % safeImages.length;
      setLightboxIndex(next);
      setCommittedIndex(next);
    },
    [lightboxIndex, safeImages.length, setCommittedIndex],
  );

  const shiftMainImage = useCallback(
    (delta: number) => {
      if (safeImages.length < 2) return;
      setHoverPreviewIndex(null);
      if (isControlled) {
        const next = Math.max(
          0,
          Math.min(safeImages.length - 1, controlledIndex! + delta),
        );
        onActiveIndexChange!(next);
      } else {
        setInternalIndex((prev) =>
          Math.max(0, Math.min(safeImages.length - 1, prev + delta)),
        );
      }
    },
    [isControlled, controlledIndex, onActiveIndexChange, safeImages.length],
  );

  const touchStartX = useRef<number | null>(null);
  const suppressClickOpenRef = useRef(false);

  useEffect(() => {
    if (!lightboxOpen || safeImages.length <= 1) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") shiftLightbox(-1);
      if (event.key === "ArrowRight") shiftLightbox(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, safeImages.length, shiftLightbox]);

  const mainImagePriority = committedIndex === 0 && hoverPreviewIndex === null;

  function onHeroTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onHeroTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current == null || safeImages.length < 2) {
      touchStartX.current = null;
      return;
    }
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    suppressClickOpenRef.current = true;
    window.setTimeout(() => {
      suppressClickOpenRef.current = false;
    }, 380);
    if (dx > 0) {
      shiftMainImage(-1);
    } else {
      shiftMainImage(1);
    }
  }

  function onHeroClickOpen() {
    if (suppressClickOpenRef.current) return;
    openLightbox();
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted touch-pan-y">
          {activeUrl ? (
            <button
              type="button"
              className="relative block size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:touch-auto"
              aria-label={labels.openPreview}
              onClick={onHeroClickOpen}
              onTouchStart={onHeroTouchStart}
              onTouchEnd={onHeroTouchEnd}
            >
              <Image
                src={activeUrl}
                alt={activeImage?.alt || fallbackAlt}
                fill
                className="object-cover transition-transform duration-150 hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={mainImagePriority}
                draggable={false}
              />
            </button>
          ) : null}
          {overlay ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[min(100%,12rem)]">
              {overlay}
            </div>
          ) : null}

          {features.pdpGalleryMobileArrows && safeImages.length > 1 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center md:hidden">
              <div className="pointer-events-auto flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/35 bg-transparent text-lg leading-none text-foreground shadow-none disabled:opacity-35 dark:border-white/45 dark:text-white"
                  aria-label={labels.previousImage}
                  disabled={committedIndex <= 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    shiftMainImage(-1);
                  }}
                >
                  ‹
                </button>
                <span className="min-w-10 select-none text-center text-[11px] font-semibold tabular-nums text-foreground drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] dark:text-white dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                  {committedIndex + 1}/{safeImages.length}
                </span>
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/35 bg-transparent text-lg leading-none text-foreground shadow-none disabled:opacity-35 dark:border-white/45 dark:text-white"
                  aria-label={labels.nextImage}
                  disabled={committedIndex >= safeImages.length - 1}
                  onClick={(event) => {
                    event.stopPropagation();
                    shiftMainImage(1);
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {safeImages.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {safeImages.map((image, index) => {
              const thumbUrl = getMediaUrl(image.url);
              const isCommittedActive = index === committedIndex;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    setHoverPreviewIndex(null);
                    setCommittedIndex(index);
                  }}
                  onMouseEnter={() => setHoverPreviewIndex(index)}
                  onMouseLeave={() =>
                    setHoverPreviewIndex((prev) => (prev === index ? null : prev))
                  }
                  onFocus={() => setHoverPreviewIndex(index)}
                  onBlur={() =>
                    setHoverPreviewIndex((prev) => (prev === index ? null : prev))
                  }
                  className={`relative aspect-square h-17 w-17 shrink-0 overflow-hidden rounded-md border transition-colors md:h-auto md:w-auto ${
                    isCommittedActive ? "border-primary" : "border-border"
                  }`}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={isCommittedActive ? true : undefined}
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt={image.alt || fallbackAlt}
                      fill
                      className="object-cover"
                      sizes="80px"
                      draggable={false}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        className="relative z-200"
      >
        <div className="fixed inset-0 bg-black/85" aria-hidden />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel className="relative flex max-h-[90vh] w-full max-w-5xl flex-col gap-4 rounded-xl bg-card p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="sr-only">{labels.dialogTitle}</DialogTitle>
              <p className="text-sm text-muted-foreground tabular-nums">
                {safeImages.length > 0 ? `${lightboxIndex + 1} / ${safeImages.length}` : null}
              </p>
              <button
                type="button"
                className="shrink-0 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                onClick={() => setLightboxOpen(false)}
              >
                {labels.closePreview}
              </button>
            </div>

            <div className="relative mx-auto flex min-h-0 w-full flex-1 items-center justify-center">
              {lightboxUrl ? (
                <div className="relative h-[min(75vh,720px)] w-full">
                  <Image
                    src={lightboxUrl}
                    alt={safeImages[lightboxIndex]?.alt || fallbackAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    priority
                  />
                </div>
              ) : null}

              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-md border border-border bg-background/95 px-3 py-2 text-sm font-medium shadow backdrop-blur-sm transition hover:bg-muted sm:left-2"
                    aria-label={labels.previousImage}
                    onClick={() => shiftLightbox(-1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-md border border-border bg-background/95 px-3 py-2 text-sm font-medium shadow backdrop-blur-sm transition hover:bg-muted sm:right-2"
                    aria-label={labels.nextImage}
                    onClick={() => shiftLightbox(1)}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
