"use client";

import { useEffect, useState } from "react";
import { features } from "@/lib/config/features";
import { useCart } from "@/lib/hooks/use-cart";
import { useStore } from "@/lib/hooks/use-store";

type AddToCartButtonProps = {
  productId: string;
  variantId?: string;
  quantity?: number;
  /** PDP-only: show − / + quantity before adding to cart. Product cards keep default false. */
  showQuantityStepper?: boolean;
};

const MAX_QTY = 99;

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  showQuantityStepper = false,
}: AddToCartButtonProps) {
  const [qty, setQty] = useState(() =>
    Math.min(MAX_QTY, Math.max(1, quantity)),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { canShopCurrentArea } = useStore();
  const cartDisabled = features.multiStore && !canShopCurrentArea;

  useEffect(() => {
    setQty(1);
  }, [productId, variantId]);

  async function onAddToCart() {
    setIsAdding(true);
    try {
      await addItem(productId, variantId, qty);
      setIsAdded(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bs-cart-item-added"));
      }
      setTimeout(() => setIsAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  }

  const controls =
    showQuantityStepper && !cartDisabled ? (
      <div className="flex items-center justify-center gap-1 rounded-md border border-input bg-background px-1 py-1">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1 || isAdding}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md text-lg font-medium transition hover:bg-muted disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          −
        </button>
        <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= MAX_QTY || isAdding}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md text-lg font-medium transition hover:bg-muted disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
        >
          +
        </button>
      </div>
    ) : null;

  const button = (
    <button
      type="button"
      onClick={() => void onAddToCart()}
      disabled={isAdding || cartDisabled}
      title={
        cartDisabled
          ? "Pick a served area and store, or change location to shop here."
          : undefined
      }
      className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {cartDisabled
        ? "Not available for this area"
        : isAdding
          ? "Adding..."
          : isAdded
            ? "Added"
            : "Add to Cart"}
    </button>
  );

  if (!showQuantityStepper) {
    return button;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {controls}
      <div className="flex flex-1 flex-col">{button}</div>
    </div>
  );
}
