"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CheckoutResponse } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils/format-price";
import { useAuth } from "@/lib/hooks/use-auth";

const SESSION_KEY = "bs-checkout-result";

export function CheckoutSuccessContent({ fallbackOrderId }: { fallbackOrderId?: string }) {
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "en";
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<CheckoutResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        setData(JSON.parse(raw) as CheckoutResponse);
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

  const orderNumber = data?.order?.orderNumber;
  const orderId = data?.order?.id ?? fallbackOrderId;

  const copyOrderNumber = useCallback(async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable */
    }
  }, [orderNumber]);

  if (!data && !fallbackOrderId) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No order details available. If you placed an order, you can track it using your order number.
        </p>
        <Link
          href={`/${locale}/track-order`}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Track Your Order
        </Link>
      </main>
    );
  }

  const order = data?.order;
  const items = order?.items ?? [];
  const currency = order?.currency ?? "USD";
  const address = order?.shippingAddress;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Thank you for your purchase.
        </p>
      </header>

      {/* Order Number - Prominent */}
      {orderNumber && (
        <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Order Number
          </p>
          <p className="text-2xl font-bold tracking-wide text-emerald-800 dark:text-emerald-300 sm:text-3xl">
            {orderNumber}
          </p>
          <button
            type="button"
            onClick={copyOrderNumber}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-500">
            Save this order number. You can use it to track your order or contact our support team.
          </p>
        </section>
      )}

      {/* Order Items */}
      {items.length > 0 && (
        <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Order Summary
          </h2>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {item.productName}
                {item.variantName ? ` — ${item.variantName}` : ""}
                {" "}
                <span className="text-slate-500">x {item.quantity}</span>
              </span>
              <span className="font-medium">{formatPrice(item.totalPrice, currency)}</span>
            </div>
          ))}

          {order?.subtotal != null && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm dark:border-slate-800">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatPrice(order.subtotal, currency)}</span>
            </div>
          )}

          {order?.grandTotal != null && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-slate-800">
              <span>Total</span>
              <span>{formatPrice(order.grandTotal, currency)}</span>
            </div>
          )}
        </section>
      )}

      {/* Shipping Address */}
      {address && (
        <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Shipping Address
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {address.firstName} {address.lastName}
            <br />
            {address.street1}
            {address.street2 ? <><br />{address.street2}</> : null}
            <br />
            {address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode}
            <br />
            {address.country}
            {address.phone ? <><br />{address.phone}</> : null}
          </p>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {isAuthenticated && orderId ? (
          <Link
            href={`/${locale}/order/${orderId}`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            View Order
          </Link>
        ) : (
          <Link
            href={`/${locale}/track-order`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Track Your Order
          </Link>
        )}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
