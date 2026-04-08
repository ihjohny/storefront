"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { features } from "@/lib/config/features";
import type { CartItem as CartItemType } from "@/lib/types/cart";
import { useCart } from "@/lib/hooks/use-cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartVendorGroup } from "@/components/cart/cart-vendor-group";

type CartPageProps = {
  params: Promise<{ locale: string }>;
};

function itemKey(item: CartItemType) {
  return `${item.product.id}-${item.variant?.id ?? "no-variant"}`;
}

export default function CartPage({ params }: CartPageProps) {
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const { locale } = use(params);
  const resolvedLocale = locale || "en";

  const groupedByVendor = useMemo(() => {
    const map = new Map<string, CartItemType[]>();
    items.forEach((item) => {
      const vendorName = item.vendor?.name || "General";
      const existing = map.get(vendorName) ?? [];
      existing.push(item);
      map.set(vendorName, existing);
    });
    return Array.from(map.entries());
  }, [items]);

  const onIncrease = (item: CartItemType) =>
    updateQuantity(item.product.id, item.variant?.id ?? null, item.quantity + 1);
  const onDecrease = (item: CartItemType) =>
    updateQuantity(item.product.id, item.variant?.id ?? null, Math.max(0, item.quantity - 1));
  const onRemove = (item: CartItemType) =>
    removeItem(item.product.id, item.variant?.id ?? null);

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Your cart is empty</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Add products to your cart and continue checkout when you are ready.
        </p>
        <Link
          href={`/${resolvedLocale}/products`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Shopping Cart</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Review items, update quantities, and proceed to checkout.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {features.multivendor ? (
            groupedByVendor.map(([vendorName, vendorItems]) => (
              <CartVendorGroup
                key={vendorName}
                locale={resolvedLocale}
                vendorName={vendorName}
                items={vendorItems}
                isLoading={isLoading}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={itemKey(item)}
                  locale={resolvedLocale}
                  item={item}
                  isLoading={isLoading}
                  onIncrease={() => onIncrease(item)}
                  onDecrease={() => onDecrease(item)}
                  onRemove={() => onRemove(item)}
                />
              ))}
            </div>
          )}
        </div>

        <CartSummary
          locale={resolvedLocale}
          subtotal={subtotal}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
        />
      </section>
    </main>
  );
}
