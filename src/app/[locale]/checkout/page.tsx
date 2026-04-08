"use client";

import { use } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  use(params);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Checkout</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Complete your order in a few quick steps.
        </p>
      </header>
      <CheckoutForm />
    </main>
  );
}
