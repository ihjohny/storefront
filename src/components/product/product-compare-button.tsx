"use client";

import { features } from "@/lib/config/features";
import { useProductCompareOptional } from "@/providers/product-compare-provider";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";

function CompareGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

type ProductCompareButtonProps = {
  productId: string;
  /** Pin comparison to this SKU when set (matches PDP selection). Omit or null for product-level rows. */
  variantId?: string | null;
  labels: ProductCompareLabels;
};

/** Icon-only control for PDP / Quick View (not used on listing cards). */
export function ProductCompareButton({
  productId,
  variantId = null,
  labels,
}: ProductCompareButtonProps) {
  const ctx = useProductCompareOptional();

  if (!features.productCompareEnabled || !ctx) {
    return null;
  }

  const { hydrated, toggleEntry, hasEntry, isFull } = ctx;
  const selected = hasEntry(productId, variantId);
  const blocked = !selected && isFull;

  const ariaLabel =
    selected ?
      `${labels.added}. ${labels.removeColumn}`
    : blocked ?
      labels.maxReached
    : labels.add;

  const titleHint =
    blocked ? labels.maxReached
    : selected ? labels.added
    : labels.add;

  return (
    <button
      type="button"
      disabled={!hydrated || blocked}
      title={titleHint}
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={() => {
        if (!hydrated || blocked) {
          return;
        }
        toggleEntry(productId, variantId);
      }}
      className={
        selected ?
          "inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-primary/10 text-primary shadow-sm transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        : "inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      }
    >
      <CompareGlyph className="size-5" />
    </button>
  );
}
