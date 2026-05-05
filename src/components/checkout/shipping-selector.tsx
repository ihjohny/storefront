"use client";

import type { ShippingMethod } from "@/lib/api/shipping";
import type { CheckoutShippingCopy } from "@/lib/types/checkout-copy";
import {
  formatShippingOrderConstraints,
  fulfillmentHintLabel,
  inferFulfillmentHint,
  pricingTypeLabel,
} from "@/lib/shipping/shipping-display";
import { formatPrice } from "@/lib/utils/format-price";

type ShippingSelectorProps = {
  copy: CheckoutShippingCopy;
  vendorKeys: string[];
  methods: ShippingMethod[];
  selectedByVendor: Record<string, string>;
  onChange: (vendorKey: string, methodId: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ShippingSelector({
  copy,
  vendorKeys,
  methods,
  selectedByVendor,
  onChange,
  onBack,
  onContinue,
}: ShippingSelectorProps) {
  const hasMethods = methods.length > 0;
  const allSelected =
    hasMethods &&
    vendorKeys.length > 0 &&
    vendorKeys.every((vendorKey) => Boolean(selectedByVendor[vendorKey]));

  return (
    <section className="space-y-4">
      {!hasMethods ? (
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
          <p className="font-semibold text-foreground">{copy.emptyTitle}</p>
          <p className="mt-2 text-muted-foreground">{copy.emptyBody}</p>
        </div>
      ) : (
        vendorKeys.map((vendorKey, index) => (
          <div
            key={vendorKey}
            className="space-y-2 rounded-xl border border-border p-4"
          >
            <h3 className="text-sm font-semibold">
              {vendorKeys.length > 1
                ? copy.headingVendor.replace("{{n}}", String(index + 1))
                : copy.headingSingle}
            </h3>
            <div className="space-y-2">
              {methods.map((method) => {
                const hint = inferFulfillmentHint(method);
                const constraintLine = formatShippingOrderConstraints(
                  method,
                  copy,
                  formatPrice,
                );
                return (
                  <label
                    key={`${vendorKey}-${method.id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm"
                  >
                    <input
                      type="radio"
                      name={`shipping-${vendorKey}`}
                      checked={selectedByVendor[vendorKey] === method.id}
                      onChange={() => onChange(vendorKey, method.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {hint ? (
                          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {fulfillmentHintLabel(hint, copy)}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        {pricingTypeLabel(method, copy)}
                      </span>
                      {constraintLine ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {constraintLine}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatPrice(method.rate, method.currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
        >
          {copy.back}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!allSelected}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {copy.continueReview}
        </button>
      </div>
    </section>
  );
}
