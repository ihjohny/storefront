"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { RecentlyViewedItem } from "./recently-viewed-tracker";
import { PriceDisplay } from "@/components/shared/price-display";

interface RecentlyViewedSectionProps {
  locale: string;
  currentProductId?: string;
  title?: string;
}

const STORAGE_KEY = "bs_recently_viewed";

export function RecentlyViewedSection({
  locale,
  currentProductId,
  title = "Recently Viewed Products",
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentlyViewedItem[] = JSON.parse(raw);
        // Exclude current product if on a PDP
        const filtered = currentProductId
          ? parsed.filter((item) => item.id !== currentProductId)
          : parsed;
        setItems(filtered.slice(0, 6));
      }
    } catch {
      // Ignore
    }
  }, [currentProductId]);

  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch {
      // Ignore
    }
  }

  if (!mounted || items.length === 0) return null;

  return (
    <section className="space-y-4 py-8 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <span className="text-xs text-muted-foreground">({items.length} items)</span>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3 shadow-2xs transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="space-y-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {item.brand ? (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.brand}
                </p>
              ) : null}

              <Link href={`/${locale}/products/${item.slug}`} className="block">
                <h3 className="line-clamp-2 text-xs font-medium text-foreground hover:underline">
                  {item.name}
                </h3>
              </Link>
            </div>

            <div className="mt-2 pt-2 border-t border-border">
              <PriceDisplay
                price={item.price}
                compareAtPrice={null}
                currency={item.currency}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
