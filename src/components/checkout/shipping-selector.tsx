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
          className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <h3 className="text-sm font-semibold">
            {vendorKeys.length > 1 ? `Vendor ${index + 1} shipping` : "Shipping method"}
          </h3>
          <div className="space-y-2">
            {methods.map((method) => (
              <label
                key={`${vendorKey}-${method.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"
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
                  <span className="block text-slate-600 dark:text-slate-300">
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
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!allSelected}
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Continue to Review
        </button>
      </div>
    </section>
  );
}
