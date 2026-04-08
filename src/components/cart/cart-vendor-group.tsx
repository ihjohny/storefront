"use client";

import type { CartItem as CartItemType } from "@/lib/types/cart";
import { CartItem } from "@/components/cart/cart-item";

type CartVendorGroupProps = {
  locale: string;
  vendorName: string;
  items: CartItemType[];
  isLoading?: boolean;
  onIncrease: (item: CartItemType) => void;
  onDecrease: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
};

export function CartVendorGroup({
  locale,
  vendorName,
  items,
  isLoading = false,
  onIncrease,
  onDecrease,
  onRemove,
}: CartVendorGroupProps) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {vendorName}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <CartItem
            key={`${item.product.id}-${item.variant?.id ?? "no-variant"}`}
            locale={locale}
            item={item}
            isLoading={isLoading}
            onIncrease={() => onIncrease(item)}
            onDecrease={() => onDecrease(item)}
            onRemove={() => onRemove(item)}
          />
        ))}
      </div>
    </section>
  );
}
