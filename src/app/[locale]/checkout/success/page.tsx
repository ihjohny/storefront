import Link from "next/link";
import { getOrderById } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format-price";

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const orderId = firstParam(query.order);

  if (!orderId) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Order ID was not provided. Please check your account orders.
        </p>
      </main>
    );
  }

  try {
    const order = await getOrderById(orderId);

    return (
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">Payment successful</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Order #{order.orderNumber} has been placed successfully.
          </p>
        </header>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {item.productName} x {item.quantity}
              </span>
              <span>{formatPrice(item.totalPrice, order.currency)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-slate-800">
            <span>Total</span>
            <span>{formatPrice(order.grandTotal, order.currency)}</span>
          </div>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/order/${order.id}`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            View Order
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
  } catch {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We could not load your order details right now. Please check your order history.
        </p>
      </main>
    );
  }
}
