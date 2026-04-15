import { TrackOrderForm } from "@/components/order/track-order-form";

export const metadata = {
  title: "Track Your Order",
  description: "Look up your guest order using your order number and email or phone.",
};

export default function TrackOrderPage() {
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">Track Your Order</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enter your order number and the email or phone you used during checkout.
        </p>
      </header>
      <TrackOrderForm />
    </main>
  );
}
