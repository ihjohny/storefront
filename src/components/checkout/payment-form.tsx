"use client";

type PaymentFormProps = {
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onBack: () => void;
  onSubmit: () => Promise<void> | void;
};

export function PaymentForm({
  isSubmitting = false,
  errorMessage,
  onBack,
  onSubmit,
}: PaymentFormProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="text-lg font-semibold">Payment</h3>
      <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        Simulated payment — your order will be placed immediately without
        charging any real payment method.
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
          Back
        </button>
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? "Processing..." : "Place Order (Simulated)"}
        </button>
      </div>
    </section>
  );
}
