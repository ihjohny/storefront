"use client";

import Link from "next/link";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/hooks/use-cart";
import { formatPrice } from "@/lib/utils/format-price";

type CartDrawerProps = {
  locale: string;
};

export function CartDrawer({ locale }: CartDrawerProps) {
  const { items, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const previewItems = useMemo(() => items.slice(0, 3), [items]);

  useEffect(() => {
    function onItemAdded() {
      setIsOpen(true);
    }

    window.addEventListener("bs-cart-item-added", onItemAdded);
    return () => {
      window.removeEventListener("bs-cart-item-added", onItemAdded);
    };
  }, []);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="flex h-full w-full max-w-sm flex-col gap-4 bg-white p-4 shadow-xl dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Cart</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
                >
                  Close
                </button>
              </div>

              {previewItems.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your cart is empty.
                </p>
              ) : (
                <div className="space-y-2">
                  {previewItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant?.id ?? "no-variant"}`}
                      className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"
                    >
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/${locale}/cart`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
                  >
                    View Cart
                  </Link>
                  <Link
                    href={`/${locale}/checkout`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
