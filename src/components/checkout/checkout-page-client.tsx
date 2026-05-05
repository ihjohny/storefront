"use client";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { CheckoutPageCopy } from "@/lib/types/checkout-copy";

type CheckoutPageClientProps = {
  checkout: CheckoutPageCopy;
};

export function CheckoutPageClient({ checkout }: CheckoutPageClientProps) {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">{checkout.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{checkout.intro}</p>
      </header>
      <CheckoutForm copy={checkout} />
    </main>
  );
}
