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
    <aside className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Coupon code</span>
        <input
          value={couponCode}
          onChange={(event) => onCouponCodeChange(event.target.value)}
          placeholder="Enter coupon"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-300">Shipping (estimate)</span>
          <span>{formatPrice(shippingEstimate)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-800">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href={`/${locale}/checkout`}
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Proceed to Checkout
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Continue Shopping
        </Link>
      </div>
    </aside>
  );
}
