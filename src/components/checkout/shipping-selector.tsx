"use client";

import type { ShippingMethod } from "@/lib/api/shipping";
import { formatPrice } from "@/lib/utils/format-price";

type ShippingSelectorProps = {
  vendorKeys: string[];
  methods: ShippingMethod[];
  selectedByVendor: Record<string, string>;
  onChange: (vendorKey: string, methodId: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ShippingSelector({
  vendorKeys,
  methods,
  selectedByVendor,
  onChange,
  onBack,
  onContinue,
}: ShippingSelectorProps) {
  const allSelected =
    vendorKeys.length > 0 &&
    vendorKeys.every((vendorKey) => Boolean(selectedByVendor[vendorKey]));

  return (
    <section className="space-y-4">
      {vendorKeys.map((vendorKey, index) => (
        <div
          key={vendorKey}
          className="space-y-2 rounded-xl border border-border p-4"
        >
          <h3 className="text-sm font-semibold">
            {vendorKeys.length > 1 ? `Vendor ${index + 1} shipping` : "Shipping method"}
          </h3>
          <div className="space-y-2">
            {methods.map((method) => (
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
                <span className="flex-1">
                  <span className="block font-medium">{method.name}</span>
                  <span className="block text-muted-foreground">
                    {method.description || "Standard delivery"}
                  </span>
                </span>
                <span className="font-medium">{formatPrice(method.rate)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!allSelected}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          Continue to Review
        </button>
      </div>
    </section>
  );
}
