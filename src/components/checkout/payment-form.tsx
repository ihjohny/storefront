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
    <section className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-lg font-semibold">Payment</h3>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        Simulated payment — your order will be placed immediately without
        charging any real payment method.
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </p>
      ) : null}

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
          onClick={() => void onSubmit()}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {isSubmitting ? "Processing..." : "Place Order (Simulated)"}
        </button>
      </div>
    </section>
  );
}
