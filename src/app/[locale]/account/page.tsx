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

  const memberSince = formatDate(me.user.createdAt, locale);
  const subtitle = me.user.displayName?.trim()
    ? `${me.user.displayName.trim()} · Member since ${memberSince}`
    : `Member since ${memberSince}`;

  return (
    <section className="space-y-5 lg:space-y-4">
      <header className="space-y-1 lg:space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-2xl">
          Account Dashboard
        </h1>
        <p className="text-sm text-muted-foreground lg:text-[13px]">{subtitle}</p>
      </header>

      <div className="flex flex-wrap gap-1.5 lg:gap-2">
        <Link
          href={`/${locale}/account/orders`}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted sm:px-3 sm:py-1.5 sm:text-sm lg:py-1.5 lg:text-[13px]"
        >
          View All Orders
        </Link>
        <Link
          href={`/${locale}/account/addresses`}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted sm:px-3 sm:py-1.5 sm:text-sm lg:py-1.5 lg:text-[13px]"
        >
          Manage Addresses
        </Link>
        <Link
          href={`/${locale}/account/settings`}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted sm:px-3 sm:py-1.5 sm:text-sm lg:py-1.5 lg:text-[13px]"
        >
          Edit Profile
        </Link>
      </div>

      <section className="space-y-2 lg:space-y-2">
        <h2 className="text-base font-semibold text-foreground lg:text-sm">Recent Orders</h2>
        <OrderList orders={recentOrders} locale={locale} />
      </section>
    </section>
  );
}
