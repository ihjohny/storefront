"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils/format-price";

type CartSummaryProps = {
  locale: string;
  subtotal: number;
  discountTotal: number;
  appliedCouponCode: string | null;
  applyCouponCode: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  isLoading: boolean;
  checkoutLabel?: string;
  continueShoppingLabel?: string;
};

export function CartSummary({
  locale,
  subtotal,
  discountTotal,
  appliedCouponCode,
  applyCouponCode,
  removeCoupon,
  isLoading,
  checkoutLabel = "Proceed to checkout",
  continueShoppingLabel = "Continue shopping",
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCouponInput(appliedCouponCode ?? "");
  }, [appliedCouponCode]);

  const shippingEstimate = 0;
  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const total = afterDiscount + shippingEstimate;

  async function handleApplyCoupon(event: React.FormEvent) {
    event.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    try {
      await applyCouponCode(code);
      setCouponSuccess("Coupon applied.");
    } catch (err) {
      setCouponError(getApiErrorMessage(err));
    }
  }

  async function handleRemoveCoupon() {
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await removeCoupon();
      setCouponInput("");
    } catch (err) {
      setCouponError(getApiErrorMessage(err));
    }
  }

  return (
    <aside className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-lg font-semibold">Order summary</h2>

      <form onSubmit={(e) => void handleApplyCoupon(e)} className="space-y-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">Coupon code</span>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="Enter code"
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="shrink-0 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
            >
              Apply
            </button>
          </div>
        </label>
        {appliedCouponCode ? (
          <button
            type="button"
            onClick={() => void handleRemoveCoupon()}
            disabled={isLoading}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
          >
            Remove coupon
          </button>
        ) : null}
        {couponError ? (
          <p className="text-sm text-destructive" role="alert">
            {couponError}
          </p>
        ) : null}
        {couponSuccess && !couponError ? (
          <p className="text-sm text-primary" role="status">
            {couponSuccess}
          </p>
        ) : null}
      </form>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex items-center justify-between text-primary">
            <span>Discount{appliedCouponCode ? ` (${appliedCouponCode})` : ""}</span>
            <span>−{formatPrice(discountTotal)}</span>
          </div>
        ) : null}
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
          {checkoutLabel}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition hover:bg-muted"
        >
          {continueShoppingLabel}
        </Link>
      </div>
    </aside>
  );
}
