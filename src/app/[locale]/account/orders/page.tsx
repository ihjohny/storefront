import { cookies } from "next/headers";
import { getMe } from "@/lib/api/auth";
import { getOrders } from "@/lib/api/orders";
import { OrderList } from "@/components/account/order-list";
import { Pagination } from "@/components/shared/pagination";

type AccountOrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountOrdersPage({
  params,
  searchParams,
}: AccountOrdersPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number(firstParam(query.page) || "1"));

  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;
  const cookieHeader = token ? `payload-token=${token}` : undefined;
  const me = await getMe(cookieHeader);
  if (!me.user) {
    return null;
  }

  const response = await getOrders(me.user.id, page, cookieHeader);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Order History</h1>
        <p className="text-xs text-muted-foreground">Manage and track your past purchases</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">All Orders ({response.totalDocs})</h2>
        <OrderList orders={response.docs} locale={locale} />
      </div>

      <Pagination
        currentPage={response.page}
        totalPages={response.totalPages}
        pathname={`/${locale}/account/orders`}
        query={{}}
      />
    </section>
  );
}
