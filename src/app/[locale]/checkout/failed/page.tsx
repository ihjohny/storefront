import Link from "next/link";

type FailedPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutFailedPage({
  params,
  searchParams,
}: FailedPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const orderId = firstParam(query.order);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Payment failed</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {orderId
          ? `We could not complete payment for order ${orderId}.`
          : "We could not complete your payment."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/${locale}/checkout`}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Try Again
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Contact Support
        </Link>
      </div>
    </main>
  );
}
