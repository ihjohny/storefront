import Link from "next/link";

type CancelPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutCancelPage({
  params,
  searchParams,
}: CancelPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const orderId = firstParam(query.order);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Payment cancelled</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {orderId
          ? `You cancelled payment for order ${orderId}.`
          : "You cancelled your payment session."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/${locale}/cart`}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Return to Cart
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
