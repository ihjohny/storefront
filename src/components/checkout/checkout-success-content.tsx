"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CheckoutResponse } from "@/lib/types/order";
import type { CheckoutOutcomesCopy } from "@/lib/types/checkout-copy";
import { formatPrice } from "@/lib/utils/format-price";
import { useAuth } from "@/lib/hooks/use-auth";
import { fillOutcomeTemplate } from "@/lib/checkout/fill-outcome-template";

const SESSION_KEY = "bs-checkout-result";

function storefrontApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
}

export type CheckoutSuccessContentProps = {
  outcomes: CheckoutOutcomesCopy;
  fallbackOrderId?: string;
  fallbackOrderNumber?: string;
};

export function CheckoutSuccessContent({
  outcomes,
  fallbackOrderId,
  fallbackOrderNumber,
}: CheckoutSuccessContentProps) {
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

  /** SSL Commerz appends `val_id` on redirect; IPN cannot reach localhost — reconcile via backend. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const valId = sp.get("val_id")?.trim();
    if (!valId) return;

    const dedupeKey = `bs-ssl-sync-ok:${valId}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      /* continue */
    }

    const qs = new URLSearchParams({ val_id: valId });
    const tranId = sp.get("tran_id")?.trim();
    if (tranId) qs.set("tran_id", tranId);

    void fetch(`${storefrontApiBase()}/payments/sslcommerz/sync-paid?${qs}`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })
      .then((res) => {
        if (res.ok) {
          try {
            sessionStorage.setItem(dedupeKey, "1");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* best-effort reconciliation */
      });
  }, []);

  const order = data?.order;
  const orderNumber =
    order?.orderNumber ?? (fallbackOrderNumber?.trim() || undefined);
  const orderId = order?.id ?? fallbackOrderId;
  const urlReference =
    (fallbackOrderNumber?.trim() || fallbackOrderId?.trim()) ?? "";
  const isCod = order?.checkoutPaymentChannel === "cash_on_delivery";

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

  /** Returned from SSL without session snapshot — backend sends `orderNumber=` on redirect URLs. */
  if (!data && urlReference) {
    const refLine = fillOutcomeTemplate(outcomes.successFallbackOrderNumberLine, {
      orderRef: urlReference,
    });
    return (
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 text-center sm:px-6 sm:text-left lg:px-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">{outcomes.successFallbackTitle}</h1>
        <p className="text-sm text-muted-foreground">{outcomes.successFallbackBody}</p>
        <p className="text-sm font-medium text-foreground">{refLine}</p>
        <p className="text-xs text-muted-foreground">{outcomes.successFallbackTrackHint}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Link
            href={`/${locale}/track-order`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {outcomes.trackYourOrder}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
          >
            {outcomes.continueShopping}
          </Link>
        </div>
      </main>
    );
  }

  if (!data && !urlReference) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">{outcomes.successFallbackTitle}</h1>
        <p className="text-sm text-muted-foreground">{outcomes.successFallbackBody}</p>
        <Link
          href={`/${locale}/track-order`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {outcomes.trackYourOrder}
        </Link>
      </main>
    );
  }

  const items = order?.items ?? [];
  const currency = order?.currency ?? "USD";
  const address = order?.shippingAddress;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{outcomes.successHeading}</h1>
        <p className="text-sm text-muted-foreground">
          {isCod ? outcomes.successSubtitleCod : outcomes.successSubtitleOnlinePaid}
        </p>
      </header>

      {isCod ? (
        <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-foreground sm:text-left">
          {outcomes.codPaymentBanner}
        </section>
      ) : null}

      {orderNumber ? (
        <section className="rounded-xl border-2 border-primary/30 bg-primary/10 p-5 text-center">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
            Order Number
          </p>
          <p className="text-2xl font-bold tracking-wide text-foreground sm:text-3xl">{orderNumber}</p>
          <button
            type="button"
            onClick={copyOrderNumber}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {outcomes.copied}
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {outcomes.copyOrderNumber}
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">{outcomes.saveOrderNumberHint}</p>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Order Summary
          </h2>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">
                {item.productName}
                {item.variantName ? ` — ${item.variantName}` : ""}{" "}
                <span className="text-muted-foreground">x {item.quantity}</span>
              </span>
              <span className="font-medium">{formatPrice(item.totalPrice, currency)}</span>
            </div>
          ))}

          {order?.subtotal != null ? (
            <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal, currency)}</span>
            </div>
          ) : null}

          {order?.grandTotal != null ? (
            <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.grandTotal, currency)}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      {address ? (
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Shipping Address
          </h2>
          <p className="text-sm text-foreground">
            {address.firstName} {address.lastName}
            <br />
            {address.street1}
            {address.street2 ? (
              <>
                <br />
                {address.street2}
              </>
            ) : null}
            <br />
            {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postalCode}
            <br />
            {address.country}
            {address.phone ? (
              <>
                <br />
                {address.phone}
              </>
            ) : null}
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {isAuthenticated && orderId ? (
          <Link
            href={`/${locale}/order/${orderId}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            View Order
          </Link>
        ) : (
          <Link
            href={`/${locale}/track-order`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {outcomes.trackYourOrder}
          </Link>
        )}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
        >
          {outcomes.continueShopping}
        </Link>
      </div>
    </main>
  );
}
