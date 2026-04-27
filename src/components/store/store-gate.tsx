"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import type { Store } from "@/lib/types/store";
import type { ReactNode } from "react";
import { StoreDeliveryPicker } from "@/components/store/store-delivery-picker";

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
      className="group flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left text-card-foreground transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{store.name}</h3>
          {cityState && (
            <p className="mt-0.5 text-sm text-muted-foreground">{cityState}</p>
          )}
        </div>
        <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
          Select
        </span>
      </div>

      {store.address?.street && (
        <p className="text-xs text-muted-foreground">
          {store.address.street}
          {store.address.postalCode ? `, ${store.address.postalCode}` : ""}
        </p>
      )}

      {store.storeDetails?.operatingHours && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Hours:</span>{" "}
          {store.storeDetails.operatingHours}
        </p>
      )}

      {coverageAreas && coverageAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {coverageAreas.map((area) => (
            <span
              key={area}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      {store.storeDetails?.contactPhone && (
        <p className="text-xs text-muted-foreground/80">{store.storeDetails.contactPhone}</p>
      )}
    </button>
  );
}

export function StoreGate({ children }: { children: ReactNode }) {
  const { stores, selectedStore, selectStore, isLoading, serviceArea } = useStore();

  const shouldGate =
    features.multiStore && features.singleStoreCart && !selectedStore;

  if (!shouldGate) {
    return <>{children}</>;
  }

  const useGeoPicker = features.serviceAreaStoreSelection && Boolean(serviceArea);

  return (
    <>
      {children}
      <Dialog open static onClose={() => {}} className="relative z-100">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-primary"
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
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Choose your store
                </DialogTitle>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {useGeoPicker
                    ? "Set your delivery area, then pick an outlet to see products and prices for that location."
                    : "Select a store to see available products and start shopping."}
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
                    aria-hidden="true"
                  />
                </div>
              ) : useGeoPicker && serviceArea ? (
                <div className="space-y-4">
                  <StoreDeliveryPicker
                    idPrefix="bs-gate"
                    layout="spacious"
                    onCountryChange={(id) => {
                      void serviceArea.setCountry(id);
                    }}
                    onSubdivisionChange={(id) => {
                      void serviceArea.setSubdivision(id);
                    }}
                    onLocalityChange={(id) => {
                      void serviceArea.setLocality(id);
                    }}
                    onStorePick={(id) => selectStore(id)}
                  />
                </div>
              ) : stores.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No stores are currently available. Please try again later.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stores.map((store) => (
                    <StoreCard key={store.id} store={store} onSelect={selectStore} />
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
