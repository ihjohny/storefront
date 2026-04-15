"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import type { Store } from "@/lib/types/store";
import type { ReactNode } from "react";

function StoreCard({
  store,
  onSelect,
}: {
  store: Store;
  onSelect: (id: string) => void;
}) {
  const cityState = [store.address?.city, store.address?.state]
    .filter(Boolean)
    .join(", ");

  const coverageAreas = store.storeDetails?.coverageArea
    ?.map((a) => a.value)
    .filter(Boolean);

  return (
    <button
      type="button"
      onClick={() => onSelect(store.id)}
      className="group flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {store.name}
          </h3>
          {cityState && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {cityState}
            </p>
          )}
        </div>
        <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-900">
          Select
        </span>
      </div>

      {store.address?.street && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {store.address.street}
          {store.address.postalCode ? `, ${store.address.postalCode}` : ""}
        </p>
      )}

      {store.storeDetails?.operatingHours && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Hours:
          </span>{" "}
          {store.storeDetails.operatingHours}
        </p>
      )}

      {coverageAreas && coverageAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {coverageAreas.map((area) => (
            <span
              key={area}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      {store.storeDetails?.contactPhone && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {store.storeDetails.contactPhone}
        </p>
      )}
    </button>
  );
}

export function StoreGate({ children }: { children: ReactNode }) {
  const { stores, selectedStore, selectStore, isLoading } = useStore();

  const shouldGate =
    features.multiStore && features.singleStoreCart && !selectedStore;

  if (!shouldGate) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog open static onClose={() => {}} className="relative z-100">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-950 sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-slate-600 dark:text-slate-300"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9l3-4h12l3 4M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 13h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  Choose Your Store
                </DialogTitle>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Select a store to see available products and start shopping.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
                </div>
              ) : stores.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No stores are currently available. Please try again later.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onSelect={selectStore}
                    />
                  ))}
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
