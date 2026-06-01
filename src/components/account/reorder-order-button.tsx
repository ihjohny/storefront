"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks/use-cart";
import { useStore } from "@/lib/hooks/use-store";
import { features } from "@/lib/config/features";

type ReorderOrderButtonProps = {
  locale: string;
  orderStore?: string | { id?: string } | null;
  items: Array<{
    product?: string | { id?: string } | null;
    variant?: string | { id?: string } | null;
    quantity: number;
  }>;
  className?: string;
};

function relationId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof value.id === "string") {
    const t = value.id.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

export function ReorderOrderButton({
  locale,
  orderStore,
  items,
  className,
}: ReorderOrderButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { commerceStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectedStoreId = commerceStore?.id ?? null;
  const orderStoreId = relationId(orderStore);
  const isStoreApplicable =
    !features.multiStore ||
    selectedStoreId == null ||
    orderStoreId == null ||
    orderStoreId === selectedStoreId;

  async function handleReorder() {
    setFeedback(null);
    if (features.multiStore && features.singleStoreCart && !selectedStoreId) {
      setFeedback("Please select a store before reordering.");
      return;
    }
    setIsSubmitting(true);
    try {
      let added = 0;
      for (const line of items) {
        const productId = relationId(line.product);
        if (!productId) continue;
        const variantId = relationId(line.variant) ?? undefined;
        const qty = Number(line.quantity) > 0 ? Number(line.quantity) : 1;
        await addItem(productId, variantId, qty);
        added += 1;
      }
      if (added === 0) {
        setFeedback("No reorderable items were found in this order.");
        return;
      }
      setFeedback("Items added to cart.");
      router.push(`/${locale}/cart`);
    } catch {
      setFeedback("Could not add all items to cart. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isStoreApplicable) {
    return (
      <p className="text-xs text-muted-foreground">
        Reorder is only available for your currently selected store.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void handleReorder()}
        disabled={isSubmitting}
        className={
          className ??
          "rounded-md border border-border px-3 py-1.5 text-sm transition hover:bg-muted disabled:opacity-60"
        }
      >
        {isSubmitting ? "Reordering..." : "Reorder"}
      </button>
      {feedback ? <p className="text-xs text-muted-foreground">{feedback}</p> : null}
    </div>
  );
}
