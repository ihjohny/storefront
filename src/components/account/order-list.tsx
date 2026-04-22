import Link from "next/link";
import type { Order } from "@/lib/types/order";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import { Badge } from "@/components/shared/badge";
import { EmptyState } from "@/components/shared/empty-state";

type OrderListProps = {
  orders: Order[];
  locale: string;
};

function statusVariant(status: string) {
  if (["completed", "delivered"].includes(status)) return "success" as const;
  if (["cancelled", "refunded"].includes(status)) return "danger" as const;
  if (["processing", "partially-shipped", "shipped"].includes(status)) return "info" as const;
  return "warning" as const;
}

export function OrderList({ orders, locale }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Orders you place will appear here."
        actionLabel="Shop Products"
        actionHref={`/${locale}/products`}
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article
          key={order.id}
          className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/${locale}/order/${order.id}`}
              className="text-sm font-semibold text-foreground hover:text-primary hover:underline sm:text-base"
            >
              #{order.orderNumber}
            </Link>
            <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{formatDate(order.placedAt, locale)}</span>
            <span>{order.items.length} items</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatPrice(order.grandTotal, order.currency)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
