"use client";

import Link from "next/link";
import { use, useState } from "react";
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
        <p className="text-sm text-muted-foreground sm:text-base">
          Add products to your cart and continue checkout when you are ready.
        </p>
        <Link
          href={`/${resolvedLocale}/products`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
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
        <p className="text-sm text-muted-foreground">
          Review items, update quantities, and proceed to checkout.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {features.multivendor ? (
            <CartVendorGroup
              locale={resolvedLocale}
              items={items}
              isLoading={isLoading}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
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
