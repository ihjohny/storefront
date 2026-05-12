"use client";

import Link from "next/link";
import { features } from "@/lib/config/features";
import { serializeCompareItemsQuery } from "@/lib/product-compare/compare-line-items";
import { useProductCompare } from "@/providers/product-compare-provider";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";

type ProductCompareTrayProps = {
  locale: string;
  labels: ProductCompareLabels;
};

export function ProductCompareTray({ locale, labels }: ProductCompareTrayProps) {
  if (!features.productCompareEnabled) {
    return null;
  }

  const { entries, hydrated, clearAll } = useProductCompare();

  if (!hydrated || entries.length === 0) {
    return null;
  }

  const qs = serializeCompareItemsQuery(entries);
  const href =
    qs ?
      `/${locale}/compare?items=${encodeURIComponent(qs)}`
    : `/${locale}/compare`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[35] flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-lg flex-wrap items-center gap-2 rounded-xl border border-border bg-card/95 px-4 py-3 text-sm shadow-lg backdrop-blur-sm">
        <span className="font-medium text-foreground">
          {labels.trayTitle}{" "}
          <span className="tabular-nums text-muted-foreground">({entries.length})</span>
        </span>
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {labels.trayAction}
        </Link>
        <button
          type="button"
          onClick={() => clearAll()}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
        >
          {labels.trayClear}
        </button>
      </div>
    </div>
  );
}
