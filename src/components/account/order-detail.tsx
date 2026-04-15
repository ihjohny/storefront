import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types/order";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";
import { Badge } from "@/components/shared/badge";

type OrderDetailProps = {
  order: Order;
  locale: string;
  isMultivendor: boolean;
};

function statusVariant(status: OrderStatus) {
  if (["completed", "delivered"].includes(status)) {
    return "success" as const;
  }
  if (["cancelled", "refunded"].includes(status)) {
    return "danger" as const;
  }
  if (["processing", "partially-shipped", "shipped"].includes(status)) {
    return "info" as const;
  }
  return "warning" as const;
}

export function OrderDetail({ order, locale, isMultivendor }: OrderDetailProps) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Order #{order.orderNumber}</h1>
          <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Placed on {formatDate(order.placedAt, locale)} - Payment: {order.paymentStatus}
        </p>
      </header>

      {order.buyerSnapshot &&
      (order.buyerSnapshot.email || order.buyerSnapshot.name || order.buyerSnapshot.phone) ? (
        <section className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
          <h2 className="text-lg font-semibold">Contact at time of order</h2>
          <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
            {order.buyerSnapshot.name ? <p>{order.buyerSnapshot.name}</p> : null}
            {order.buyerSnapshot.email ? <p>{order.buyerSnapshot.email}</p> : null}
            {order.buyerSnapshot.phone ? <p>{order.buyerSnapshot.phone}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold">Items</h2>
        {(order.items ?? []).map((item, index) => (
          <div
            key={
              item.id ||
              `${order.orderNumber}-line-${index}-${String(item.productName ?? "")}-${item.variantName ?? ""}`
            }
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.productName ?? "Item"}</p>
              {isMultivendor && item.vendorNameSnapshot ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.vendorNameSnapshot}</p>
              ) : null}
              <p className="text-slate-600 dark:text-slate-300">
                Qty {item.quantity}
                {item.variantName ? ` - ${item.variantName}` : ""}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.totalPrice, order.currency)}</p>
          </div>
        ))}
      </section>

      {isMultivendor && order.subOrders?.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Vendor Sub-orders</h2>
          {order.subOrders.map((subOrder) => (
            <article
              key={subOrder.id}
              className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {subOrder.tenantNameSnapshot?.trim() ||
                  (typeof subOrder.tenant === "object" ? subOrder.tenant.name : "Vendor")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">Sub-order #{subOrder.subOrderNumber}</p>
                <Badge variant={statusVariant(subOrder.status as OrderStatus)}>
                  {subOrder.status}
                </Badge>
              </div>
              {subOrder.trackingUrl ? (
                <Link
                  href={subOrder.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
                >
                  Track shipment ({subOrder.trackingNumber || "Open tracking"})
                </Link>
              ) : subOrder.trackingNumber ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tracking: {subOrder.trackingNumber}
                </p>
              ) : null}
              <p className="text-sm">
                Subtotal: {formatPrice(subOrder.subtotal, order.currency)}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
          <h3 className="font-semibold">Shipping address</h3>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p>
            {order.shippingAddress.street1}
            {order.shippingAddress.street2 ? `, ${order.shippingAddress.street2}` : ""}
          </p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
          <h3 className="font-semibold">Billing address</h3>
          <p>
            {order.billingAddress.firstName} {order.billingAddress.lastName}
          </p>
          <p>
            {order.billingAddress.street1}
            {order.billingAddress.street2 ? `, ${order.billingAddress.street2}` : ""}
          </p>
          <p>
            {order.billingAddress.city}, {order.billingAddress.postalCode}
          </p>
          <p>{order.billingAddress.country}</p>
        </div>
      </section>

      <section className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{formatPrice(order.shippingTotal, order.currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span>{formatPrice(order.taxTotal, order.currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <span>-{formatPrice(order.discountTotal, order.currency)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-800">
          <span>Grand Total</span>
          <span>{formatPrice(order.grandTotal, order.currency)}</span>
        </div>
      </section>
    </main>
  );
}
