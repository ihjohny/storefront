"use client";

import { useState } from "react";
import { features } from "@/lib/config/features";
import { useCart } from "@/lib/hooks/use-cart";
import { useStore } from "@/lib/hooks/use-store";

type AddToCartButtonProps = {
  productId: string;
  variantId?: string;
  quantity?: number;
};

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { canShopCurrentArea } = useStore();
  const cartDisabled = features.multiStore && !canShopCurrentArea;

  async function onAddToCart() {
    setIsAdding(true);
    try {
      await addItem(productId, variantId, quantity);
      setIsAdded(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bs-cart-item-added"));
      }
      setTimeout(() => setIsAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onAddToCart()}
      disabled={isAdding || cartDisabled}
      title={
        cartDisabled
          ? "Pick a served area and store, or change location to shop here."
          : undefined
      }
      className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
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
}
