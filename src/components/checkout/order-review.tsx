"use client";

import type { CartItem } from "@/lib/types/cart";
import type { ShippingMethod } from "@/lib/api/shipping";
import { formatPrice } from "@/lib/utils/format-price";

type OrderReviewProps = {
  items: CartItem[];
  subtotal: number;
  selectedMethodIds: string[];
  shippingMethods: ShippingMethod[];
};

export function OrderReview({
  items,
  subtotal,
  selectedMethodIds,
  shippingMethods,
}: OrderReviewProps) {
  const shippingTotal = selectedMethodIds.reduce((total, id) => {
    const method = shippingMethods.find((entry) => entry.id === id);
    return total + (method?.rate ?? 0);
  }, 0);

  const grandTotal = subtotal + shippingTotal;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-lg font-semibold">Review Order</h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.variant?.id ?? "no-variant"}`}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-slate-600 dark:text-slate-300">
                Qty {item.quantity}
                {item.variant ? ` - ${item.variant.name}` : ""}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Shipping</span>
          <span>{formatPrice(shippingTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </section>
  );
}
