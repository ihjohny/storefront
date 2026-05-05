"use client";

import { useMemo } from "react";
import type { CartItem } from "@/lib/types/cart";
import type { ShippingMethod } from "@/lib/api/shipping";
import { features } from "@/lib/config/features";
import { formatPrice } from "@/lib/utils/format-price";

type OrderReviewProps = {
  items: CartItem[];
  subtotal: number;
  discountTotal?: number;
  selectedMethodIds: string[];
  shippingMethods: ShippingMethod[];
};

function resolveCheckoutCurrency(
  selectedMethodIds: string[],
  shippingMethods: ShippingMethod[],
): string {
  for (const id of selectedMethodIds) {
    const m = shippingMethods.find((entry) => entry.id === id);
    const c = m?.currency?.trim();
    if (c) return c.toUpperCase();
  }
  return features.currency.default;
}

export function OrderReview({
  items,
  subtotal,
  discountTotal = 0,
  selectedMethodIds,
  shippingMethods,
}: OrderReviewProps) {
  const currency = useMemo(
    () => resolveCheckoutCurrency(selectedMethodIds, shippingMethods),
    [selectedMethodIds, shippingMethods],
  );

  const shippingTotal = selectedMethodIds.reduce((total, id) => {
    const method = shippingMethods.find((entry) => entry.id === id);
    return total + (method?.rate ?? 0);
  }, 0);

  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const grandTotal = afterDiscount + shippingTotal;

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="text-lg font-semibold">Review Order</h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.variant?.id ?? "no-variant"}`}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-muted-foreground">
                Qty {item.quantity}
                {item.variant ? ` - ${item.variant.name}` : ""}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.quantity * item.unitPrice, currency)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex items-center justify-between text-primary">
            <span>Discount</span>
            <span>−{formatPrice(discountTotal, currency)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatPrice(shippingTotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(grandTotal, currency)}</span>
        </div>
      </div>
    </section>
  );
}
