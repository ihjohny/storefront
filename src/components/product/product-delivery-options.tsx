"use client";

import { useEffect, useState } from "react";
import { getShippingMethods, type ShippingMethod } from "@/lib/api/shipping";
import type { CheckoutShippingCopy } from "@/lib/types/checkout-copy";
import {
  formatShippingOrderConstraints,
  fulfillmentHintLabel,
  inferFulfillmentHint,
  pricingTypeLabel,
} from "@/lib/shipping/shipping-display";
import { formatPrice } from "@/lib/utils/format-price";

function DisclosureChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ProductDeliveryOptionsProps = {
  title: string;
  footnote: string;
  loadingLabel: string;
  shippingCopy: CheckoutShippingCopy;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function ProductDeliveryOptions({
  title,
  footnote,
  loadingLabel,
  shippingCopy,
  collapsible = false,
  defaultOpen = true,
}: ProductDeliveryOptionsProps) {
  const [methods, setMethods] = useState<ShippingMethod[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getShippingMethods();
        if (!cancelled) setMethods(list);
      } catch {
        if (!cancelled) setMethods([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const body =
    methods === null ? (
      <p className="text-sm text-muted-foreground">{loadingLabel}</p>
    ) : methods.length === 0 ? (
      <p className="text-sm text-muted-foreground">{footnote}</p>
    ) : (
      <>
        <ul className="space-y-2 text-sm">
          {methods.slice(0, 6).map((method) => {
            const hint = inferFulfillmentHint(method);
            const constraintLine = formatShippingOrderConstraints(
              method,
              shippingCopy,
              formatPrice,
            );
            return (
              <li
                key={method.id}
                className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="block font-medium text-foreground">{method.name}</span>
                    {hint ? (
                      <span className="rounded-full border border-border bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {fulfillmentHintLabel(hint, shippingCopy)}
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-muted-foreground">{pricingTypeLabel(method, shippingCopy)}</span>
                  {constraintLine ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{constraintLine}</span>
                  ) : null}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatPrice(method.rate, method.currency)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>
      </>
    );

  if (!collapsible) {
    if (methods === null) {
      return (
        <section className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {loadingLabel}
        </section>
      );
    }
    if (methods.length === 0) {
      return (
        <section className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1">{footnote}</p>
        </section>
      );
    }
    return (
      <section className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="mt-2">{body}</div>
      </section>
    );
  }

  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-muted/30 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground">
        <span>{title}</span>
        <DisclosureChevron className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-2">{body}</div>
    </details>
  );
}
