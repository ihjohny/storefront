"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { features } from "@/lib/config/features";
import { useStore } from "@/lib/hooks/use-store";
import { useCart } from "@/lib/hooks/use-cart";
import { StoreDeliveryPicker } from "@/components/store/store-delivery-picker";

type PendingDeliveryChange =
  | { kind: "store"; storeId: string }
  | { kind: "country"; countryId: string }
  | { kind: "subdivision"; subdivisionId: string }
  | { kind: "locality"; localityId: string | null };

export function StoreSelector() {
  const { stores, selectedStore, selectStore, isLoading, serviceArea } = useStore();
  const { items, clearCart } = useCart();
  const [pendingChange, setPendingChange] = useState<PendingDeliveryChange | null>(null);

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

  const onPickerCountryChange = useCallback(
    (countryId: string) => {
      if (items.length > 0) setPendingChange({ kind: "country", countryId });
      else void serviceArea?.setCountry(countryId);
    },
    [items.length, serviceArea],
  );

  const onPickerSubdivisionChange = useCallback(
    (subdivisionId: string) => {
      if (items.length > 0) setPendingChange({ kind: "subdivision", subdivisionId });
      else void serviceArea?.setSubdivision(subdivisionId);
    },
    [items.length, serviceArea],
  );

  const onPickerLocalityChange = useCallback(
    (localityId: string | null) => {
      if (items.length > 0) setPendingChange({ kind: "locality", localityId });
      else void serviceArea?.setLocality(localityId);
    },
    [items.length, serviceArea],
  );

  const onPickerStorePick = useCallback(
    (storeId: string) => {
      if (storeId === selectedStore?.id) return;
      if (items.length > 0) setPendingChange({ kind: "store", storeId });
      else selectStore(storeId);
    },
    [items.length, selectedStore?.id, selectStore],
  );

  if (!features.multiStore) return null;
  if (isLoading) {
    return (
      <div className="inline-flex h-8 w-44 max-w-full animate-pulse items-center rounded-md bg-muted" />
    );
  }

  if (!serviceArea && stores.length === 0) {
    return (
      <div
        className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs leading-snug text-muted-foreground"
        role="status"
      >
        <p className="font-medium text-foreground">Location selection unavailable</p>
        <p className="mt-0.5">
          We couldn't load delivery areas or stores. Refresh the page, or try again shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <StoreDeliveryPicker
        idPrefix="bs-geo"
        layout="compact"
        onCountryChange={onPickerCountryChange}
        onSubdivisionChange={onPickerSubdivisionChange}
        onLocalityChange={onPickerLocalityChange}
        onStorePick={onPickerStorePick}
      />

      <Dialog open={pendingChange !== null} onClose={cancelChange} className="relative z-110">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
