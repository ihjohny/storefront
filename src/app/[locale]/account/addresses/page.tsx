"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAddressesPage, type Address } from "@/lib/api/addresses";
import { useAuth } from "@/lib/hooks/use-auth";
import { useStore } from "@/lib/hooks/use-store";
import { AddressList } from "@/components/account/address-list";
import { EmptyState } from "@/components/shared/empty-state";

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const { commerceStore, serviceArea, canShopCurrentArea } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const serviceAreaReadonly = useMemo(() => {
    if (!serviceArea || !canShopCurrentArea) return undefined;
    const c = serviceArea.countries.find((x) => x.id === serviceArea.selectedCountryId);
    const sub = serviceArea.subdivisions.find((x) => x.id === serviceArea.selectedSubdivisionId);
    if (!c || !sub) return undefined;
    const loc = serviceArea.selectedLocalityId
      ? serviceArea.localities.find((l) => l.id === serviceArea.selectedLocalityId)
      : null;
    return {
      countryIso: c.isoCode.slice(0, 2).toUpperCase(),
      region: sub.name,
      localityName: loc?.name ?? null,
    };
  }, [serviceArea, canShopCurrentArea]);

  const load = useCallback(async (nextPage = 1) => {
    if (!user?.id) {
      return null;
    }
    setIsLoading(true);
    try {
      const response = await getAddressesPage(user.id, { page: nextPage, limit: 10 });
      setAddresses(response.docs);
      setPage(response.page);
      setTotalPages(response.totalPages || 1);
      setTotalDocs(response.totalDocs || 0);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load(1);
  }, [load]);

  if (!user?.id) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Addresses</h1>
      {isLoading ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <AddressList
          addresses={[]}
          userId={user.id}
          selectedStoreId={commerceStore?.id ?? null}
          serviceArea={
            serviceArea
              ? {
                  selectedCountryId: serviceArea.selectedCountryId,
                  selectedSubdivisionId: serviceArea.selectedSubdivisionId,
                  selectedLocalityId: serviceArea.selectedLocalityId,
                }
              : undefined
          }
          serviceAreaReadonly={serviceAreaReadonly}
          onUpdated={async () => {
            await load(page);
          }}
        />
      ) : (
        <AddressList
          addresses={addresses}
          userId={user.id}
          selectedStoreId={commerceStore?.id ?? null}
          serviceArea={
            serviceArea
              ? {
                  selectedCountryId: serviceArea.selectedCountryId,
                  selectedSubdivisionId: serviceArea.selectedSubdivisionId,
                  selectedLocalityId: serviceArea.selectedLocalityId,
                }
              : undefined
          }
          serviceAreaReadonly={serviceAreaReadonly}
          onUpdated={async () => {
            const refreshed = await load(page);
            if (page > 1 && refreshed && refreshed.docs.length === 0) {
              await load(page - 1);
            }
          }}
        />
      )}
      {!isLoading && totalDocs > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-300">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void load(page - 1)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void load(page + 1)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
      {!isLoading && addresses.length === 0 ? (
        <EmptyState title="No addresses found" description="Add your first shipping address." />
      ) : null}
    </section>
  );
}
