"use client";

import type { CheckoutPaymentLabelsCopy } from "@/lib/types/checkout-copy";

type PaymentFormProps = {
  paymentMode: "online" | "cod";
  /** When paymentMode is online: matches backend test/simulated checkout in allowed environments. */
  simulatePayment?: boolean;
  labels: CheckoutPaymentLabelsCopy;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onBack: () => void;
  onSubmit: () => Promise<void> | void;
};

export function PaymentForm({
  paymentMode,
  simulatePayment = true,
  labels,
  isSubmitting = false,
  errorMessage,
  onBack,
  onSubmit,
}: PaymentFormProps) {
  const title = paymentMode === "cod" ? labels.titleCod : labels.titleOnline;
  const summary =
    paymentMode === "cod"
      ? labels.summaryCod
      : simulatePayment
        ? labels.summarySimulated
        : labels.summarySsl;

  const primaryLabel =
    paymentMode === "cod"
      ? labels.placeOrderCod
      : simulatePayment
        ? labels.placeOrderSimulated
        : labels.continueToPayment;

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        {summary}
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
        >
          {labels.back}
        </button>
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? labels.processing : primaryLabel}
        </button>
      </div>
    </section>
  );
}
