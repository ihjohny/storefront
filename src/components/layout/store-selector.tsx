"use client";

import { Fragment, useState, useCallback } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import { useCart } from "@/lib/hooks/use-cart";

export function StoreSelector() {
  const { stores, selectedStore, selectStore, isLoading } = useStore();
  const { items, clearCart } = useCart();
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null);

  const handleChange = useCallback(
    (id: string) => {
      if (id === selectedStore?.id) return;
      if (items.length > 0) {
        setPendingStoreId(id);
      } else {
        selectStore(id);
      }
    },
    [items.length, selectedStore?.id, selectStore],
  );

  const confirmChange = useCallback(async () => {
    if (!pendingStoreId) return;
    await clearCart();
    selectStore(pendingStoreId);
    setPendingStoreId(null);
  }, [clearCart, pendingStoreId, selectStore]);

  const cancelChange = useCallback(() => {
    setPendingStoreId(null);
  }, []);

  if (!features.multiStore) return null;
  if (isLoading) {
    return (
      <div className="inline-flex h-8 w-28 animate-pulse items-center rounded-md bg-slate-100 dark:bg-slate-800" />
    );
  }
  if (stores.length === 0) return null;

  return (
    <>
      <Listbox
        value={selectedStore?.id ?? ""}
        onChange={handleChange}
      >
        <div className="relative">
          <ListboxButton className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-slate-500 sm:text-sm">
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7l2-3h10l2 3M3 7v9a1 1 0 001 1h12a1 1 0 001-1V7M3 7h14M8 11h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="max-w-40 truncate">
              {selectedStore?.name ?? "Select Store"}
            </span>
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute left-0 z-50 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg outline-none dark:border-slate-700 dark:bg-slate-900">
              {stores.map((store) => (
                <ListboxOption
                  key={store.id}
                  value={store.id}
                  className="cursor-pointer select-none px-3 py-2 transition data-focus:bg-slate-100 data-selected:font-medium dark:data-focus:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{store.name}</p>
                      {store.address?.city && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {[store.address.city, store.address.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    {store.id === selectedStore?.id && (
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4 shrink-0 text-slate-900 dark:text-white"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 10l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {store.storeDetails?.operatingHours && (
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {store.storeDetails.operatingHours}
                    </p>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>

      <Dialog
        open={pendingStoreId !== null}
        onClose={cancelChange}
        className="relative z-110"
      >
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Change Store?
            </DialogTitle>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Switching to a different store will clear your current cart ({items.length}{" "}
              {items.length === 1 ? "item" : "items"}). This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={cancelChange}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={() => void confirmChange()}
                className="flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Change Store
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
