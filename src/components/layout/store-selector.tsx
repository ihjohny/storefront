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

function PolicyBanner({
  tier,
  extendedFeeNote,
  extendedLeadTimeNote,
  unservedMsg,
}: {
  tier: string;
  extendedFeeNote: string | null;
  extendedLeadTimeNote: string | null;
  unservedMsg: string | null;
}) {
  if (tier === "unserved") {
    return (
      <p className="mb-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100">
        {unservedMsg ||
          "Delivery is not available for this area. Try another location."}
      </p>
    );
  }
  if (tier === "extended") {
    return (
      <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
        {extendedFeeNote && <span className="block">{extendedFeeNote}</span>}
        {extendedLeadTimeNote && <span className="mt-0.5 block">{extendedLeadTimeNote}</span>}
        {!extendedFeeNote && !extendedLeadTimeNote && (
          <span>Extended delivery area: additional time or fees may apply.</span>
        )}
      </p>
    );
  }
  return null;
}

type PendingDeliveryChange =
  | { kind: "store"; storeId: string }
  | { kind: "country"; countryId: string }
  | { kind: "subdivision"; subdivisionId: string }
  | { kind: "locality"; localityId: string | null };

export function StoreSelector() {
  const { stores, selectedStore, selectStore, isLoading, serviceArea } = useStore();
  const { items, clearCart } = useCart();
  const [pendingChange, setPendingChange] = useState<PendingDeliveryChange | null>(null);

  const handleStorePick = useCallback(
    (id: string) => {
      if (id === selectedStore?.id) return;
      if (items.length > 0) {
        setPendingChange({ kind: "store", storeId: id });
      } else {
        selectStore(id);
      }
    },
    [items.length, selectedStore?.id, selectStore],
  );

  const confirmChange = useCallback(async () => {
    if (!pendingChange) return;
    const action = pendingChange;
    if (items.length > 0) {
      await clearCart();
    }
    switch (action.kind) {
      case "store":
        selectStore(action.storeId);
        break;
      case "country":
        void serviceArea?.setCountry(action.countryId);
        break;
      case "subdivision":
        void serviceArea?.setSubdivision(action.subdivisionId);
        break;
      case "locality":
        void serviceArea?.setLocality(action.localityId);
        break;
    }
    setPendingChange(null);
  }, [clearCart, pendingChange, items.length, selectStore, serviceArea]);

  const cancelChange = useCallback(() => {
    setPendingChange(null);
  }, []);

  if (!features.multiStore) return null;
  if (isLoading) {
    return (
      <div className="inline-flex h-8 w-44 max-w-full animate-pulse items-center rounded-md bg-muted" />
    );
  }

  if (!serviceArea && stores.length === 0) return null;

  const policy = serviceArea?.deliveryPolicy;

  return (
    <>
      <div className="flex max-w-full flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        {serviceArea && (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
            <label className="sr-only" htmlFor="bs-geo-country">
              Country
            </label>
            <select
              id="bs-geo-country"
              className="max-w-36 rounded-md border border-input bg-background py-1 pl-2 pr-6 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={serviceArea.selectedCountryId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === (serviceArea.selectedCountryId ?? "")) return;
                if (items.length > 0) {
                  setPendingChange({ kind: "country", countryId: v });
                } else {
                  void serviceArea.setCountry(v);
                }
              }}
            >
              {serviceArea.countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="bs-geo-sub">
              Region
            </label>
            <select
              id="bs-geo-sub"
              className="max-w-40 rounded-md border border-input bg-background py-1 pl-2 pr-6 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={serviceArea.selectedSubdivisionId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === (serviceArea.selectedSubdivisionId ?? "")) return;
                if (items.length > 0) {
                  setPendingChange({ kind: "subdivision", subdivisionId: v });
                } else {
                  void serviceArea.setSubdivision(v);
                }
              }}
            >
              {serviceArea.subdivisions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {serviceArea.localities.length > 0 && (
              <>
                <label className="sr-only" htmlFor="bs-geo-loc">
                  Locality
                </label>
                <select
                  id="bs-geo-loc"
                  className="max-w-40 rounded-md border border-input bg-background py-1 pl-2 pr-6 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  value={serviceArea.selectedLocalityId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = v === "" ? null : v;
                    const cur = serviceArea.selectedLocalityId ?? null;
                    if (next === cur) return;
                    if (items.length > 0) {
                      setPendingChange({ kind: "locality", localityId: next });
                    } else {
                      void serviceArea.setLocality(next);
                    }
                  }}
                >
                  <option value="">All areas in region</option>
                  {serviceArea.localities.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {policy && (
          <div className="min-w-0 flex-1">
            <PolicyBanner
              tier={policy.tier}
              extendedFeeNote={policy.extendedFeeNote}
              extendedLeadTimeNote={policy.extendedLeadTimeNote}
              unservedMsg={policy.unservedCustomerMessage}
            />
          </div>
        )}

        {stores.length === 0 && serviceArea && (
          <p className="text-xs text-muted-foreground">
            {serviceArea.emptyReason === "no_public_stores_for_area" &&
              "No stores serve this selection yet. Try another region or locality."}
            {serviceArea.emptyReason === "unserved_area" && policy?.tier !== "unserved" && (
              <span>No outlets available.</span>
            )}
          </p>
        )}

        {stores.length > 0 && (
          <Listbox value={selectedStore?.id ?? ""} onChange={handleStorePick}>
            <div className="relative shrink-0">
              <ListboxButton className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/60 sm:text-sm">
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-muted-foreground"
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
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
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
                <ListboxOptions className="absolute right-0 z-50 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-border bg-card py-1 text-sm text-foreground shadow-lg outline-none">
                  {stores.map((store) => (
                    <ListboxOption
                      key={store.id}
                      value={store.id}
                      className="cursor-pointer select-none px-3 py-2 transition data-focus:bg-muted data-selected:font-medium"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{store.name}</p>
                          {store.address?.city && (
                            <p className="truncate text-xs text-muted-foreground">
                              {[store.address.city, store.address.state]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        {store.id === selectedStore?.id && (
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4 shrink-0 text-primary"
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
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {store.storeDetails.operatingHours}
                        </p>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        )}
      </div>

      <Dialog open={pendingChange !== null} onClose={cancelChange} className="relative z-110">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <DialogTitle className="text-base font-semibold text-foreground">
              {pendingChange?.kind === "store" ? "Change Store?" : "Change delivery area?"}
            </DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {pendingChange?.kind === "store"
                ? "Switching to a different store will clear your current cart"
                : "Changing your delivery area will clear your current cart"}{" "}
              ({items.length} {items.length === 1 ? "item" : "items"}). This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={cancelChange}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={() => void confirmChange()}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {pendingChange?.kind === "store" ? "Change Store" : "Change area"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
