import Link from "next/link";
import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import { getOrders } from "@/lib/api/orders";
import { OrderList } from "@/components/account/order-list";
import { formatDate } from "@/lib/utils/format-date";

type AccountDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountDashboardPage({ params }: AccountDashboardPageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;

  const cookieHeader = token ? `payload-token=${token}` : undefined;
  const me = await getMe(cookieHeader);
  if (!me.user) {
    return null;
  }

  const ordersResponse = await getOrders(me.user.id, 1, cookieHeader);
  const recentOrders = ordersResponse.docs.slice(0, 5);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Account Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {me.user.email} - Member since {formatDate(me.user.createdAt, locale)}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/account/orders`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          View All Orders
        </Link>
        <Link
          href={`/${locale}/account/addresses`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          Manage Addresses
        </Link>
        <Link
          href={`/${locale}/account/settings`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          Edit Profile
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <OrderList orders={recentOrders} locale={locale} />
      </section>
    </section>
  );
}
