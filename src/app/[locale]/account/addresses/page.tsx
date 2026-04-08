"use client";

import { useCallback, useEffect, useState } from "react";
import { getAddresses, type Address } from "@/lib/api/addresses";
import { useAuth } from "@/lib/hooks/use-auth";
import { AddressList } from "@/components/account/address-list";
import { EmptyState } from "@/components/shared/empty-state";

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const next = await getAddresses(user.id);
      setAddresses(next);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user?.id) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">Addresses</h1>
      {isLoading ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <AddressList addresses={[]} userId={user.id} onUpdated={load} />
      ) : (
        <AddressList addresses={addresses} userId={user.id} onUpdated={load} />
      )}
      {!isLoading && addresses.length === 0 ? (
        <EmptyState title="No addresses found" description="Add your first shipping address." />
      ) : null}
    </section>
  );
}
