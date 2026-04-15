"use client";

import { useState, type FormEvent } from "react";
import { lookupGuestOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/format-price";
import type { Order } from "@/lib/types/order";

type LookupMode = "email" | "phone";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [mode, setMode] = useState<LookupMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);

    const trimmedOrder = orderNumber.trim();
    const trimmedId = identifier.trim();

    if (!trimmedOrder) {
      setError("Please enter your order number.");
      return;
    }
    if (!trimmedId) {
      setError(`Please enter your ${mode === "email" ? "email address" : "phone number"}.`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await lookupGuestOrder({
        orderNumber: trimmedOrder,
        guestEmail: mode === "email" ? trimmedId : undefined,
        guestPhone: mode === "phone" ? trimmedId : undefined,
      });
      setOrder(result.order);
    } catch {
      setError("Order not found. Please check your order number and email/phone and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <div>
          <label htmlFor="orderNumber" className="mb-1 block text-sm font-medium">
            Order Number
          </label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ORD-20260410-XXXX"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-400"
          />
        </div>

        <div>
          <div className="mb-2 flex gap-3">
            <button
              type="button"
              onClick={() => { setMode("email"); setIdentifier(""); }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                mode === "email"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setMode("phone"); setIdentifier(""); }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                mode === "phone"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Phone
            </button>
          </div>
          <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
            {mode === "email" ? "Email Address" : "Phone Number"}
          </label>
          <input
            id="identifier"
            type={mode === "email" ? "email" : "tel"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={mode === "email" ? "you@example.com" : "+880XXXXXXXXXX"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-400"
          />
        </div>

        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {isLoading ? "Looking up..." : "Track Order"}
        </button>
      </form>

      {order && <OrderDetails order={order} />}
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const currency = order.currency ?? "USD";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Order {order.orderNumber}</h2>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.placedAt && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Placed on {new Date(order.placedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Items</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">
              {item.productName}
              {item.variantName ? ` — ${item.variantName}` : ""}
              {" "}
              <span className="text-slate-500">x {item.quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(item.totalPrice, currency)}</span>
          </div>
        ))}
      </section>

      <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span>{formatPrice(order.subtotal, currency)}</span>
        </div>
        {order.shippingTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Shipping</span>
            <span>{formatPrice(order.shippingTotal, currency)}</span>
          </div>
        )}
        {order.discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span>-{formatPrice(order.discountTotal, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.grandTotal, currency)}</span>
        </div>
      </div>

      {order.shippingAddress && (
        <section className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <h3 className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Shipping Address</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.street1}
            {order.shippingAddress.street2 ? <><br />{order.shippingAddress.street2}</> : null}
            <br />
            {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </section>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    cancelled: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    refunded: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </span>
  );
}
