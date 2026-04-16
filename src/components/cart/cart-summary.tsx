"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";

type CartSummaryProps = {
  locale: string;
  subtotal: number;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
};

export function CartSummary({
  locale,
  subtotal,
  couponCode,
  onCouponCodeChange,
}: CartSummaryProps) {
  const shippingEstimate = 0;
  const total = subtotal + shippingEstimate;

  return (
    <aside className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Coupon code</span>
        <input
          value={couponCode}
          onChange={(event) => onCouponCodeChange(event.target.value)}
          placeholder="Enter coupon"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping (estimate)</span>
          <span>{formatPrice(shippingEstimate)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href={`/${locale}/checkout`}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Proceed to Checkout
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition hover:bg-muted"
        >
          Continue Shopping
        </Link>
      </div>
    </aside>
  );
}
