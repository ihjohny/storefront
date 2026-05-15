"use client";

import { useState } from "react";
import {
  createAddress,
  deleteAddress,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/api/addresses";
import {
  AddressForm,
  type AddressFormValues,
  type ServiceAreaReadonlyFields,
} from "@/components/checkout/address-form";
import { Badge } from "@/components/shared/badge";
import { isAddressCompatibleWithSelection } from "@/lib/checkout/address-store-compatibility";

type AddressListProps = {
  addresses: Address[];
  userId: string;
  selectedStoreId?: string | null;
  serviceArea?: {
    selectedCountryId: string | null;
    selectedSubdivisionId: string | null;
    selectedLocalityId: string | null;
  };
  serviceAreaReadonly?: ServiceAreaReadonlyFields;
  onUpdated: () => Promise<void>;
};

function toInput(
  values: AddressFormValues,
  userId: string,
  selectedStoreId?: string | null,
  existingAddress?: Address,
  serviceArea?: {
    selectedCountryId: string | null;
    selectedSubdivisionId: string | null;
    selectedLocalityId: string | null;
  },
): AddressInput {
  return {
    user: userId,
    label: values.label,
    firstName: values.firstName,
    lastName: values.lastName,
    street1: values.street1,
    street2: values.street2 || null,
    city: values.city,
    state: values.state || null,
    postalCode: values.postalCode,
    country: values.country.toUpperCase(),
    geoCountryId: serviceArea?.selectedCountryId ?? existingAddress?.geoCountryId ?? null,
    geoSubdivisionId:
      serviceArea?.selectedSubdivisionId ?? existingAddress?.geoSubdivisionId ?? null,
    geoLocalityId: serviceArea?.selectedLocalityId ?? existingAddress?.geoLocalityId ?? null,
    preferredStoreId: selectedStoreId ?? existingAddress?.preferredStoreId ?? null,
    phone: values.phone || null,
    isDefault: false,
  };
}

export function AddressList({
  addresses,
  userId,
  selectedStoreId,
  serviceArea,
  serviceAreaReadonly,
  onUpdated,
}: AddressListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createNew(values: AddressFormValues) {
    setIsSubmitting(true);
    try {
      await createAddress(toInput(values, userId, selectedStoreId, undefined, serviceArea));
      setIsCreating(false);
      await onUpdated();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateExisting(id: string, values: AddressFormValues) {
    setIsSubmitting(true);
    try {
      const existing = addresses.find((entry) => entry.id === id);
      await updateAddress(
        id,
        toInput(values, userId, selectedStoreId, existing, serviceArea),
      );
      setEditingId(null);
      await onUpdated();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this address?")) {
      return;
    }
    await deleteAddress(id);
    await onUpdated();
  }

  async function setDefault(id: string) {
    await Promise.all(
      addresses.map((address) =>
        updateAddress(address.id, { isDefault: address.id === id }),
      ),
    );
    await onUpdated();
  }

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setIsCreating((prev) => !prev)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
      >
        {isCreating ? "Cancel" : "Add New Address"}
      </button>

      {isCreating ? (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <AddressForm
            isSubmitting={isSubmitting}
            serviceAreaReadonly={serviceAreaReadonly}
            onSubmit={createNew}
            submitLabel="Save Address"
          />
        </div>
      ) : null}

      <div className="space-y-3">
        {addresses.map((address) => (
          <article
            key={address.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            {editingId === address.id ? (
              <AddressForm
                isSubmitting={isSubmitting}
                submitLabel="Update Address"
                defaultValues={{
                  label: address.label,
                  firstName: address.firstName,
                  lastName: address.lastName,
                  street1: address.street1,
                  street2: address.street2 || "",
                  city: address.city,
                  state: address.state || "",
                  postalCode: address.postalCode,
                  country: address.country,
                  phone: address.phone || "",
                }}
                serviceAreaReadonly={serviceAreaReadonly}
                onSubmit={(values) => updateExisting(address.id, values)}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{address.label}</p>
                  {address.isDefault ? <Badge variant="info">Default</Badge> : null}
                  {isAddressCompatibleWithSelection(address, selectedStoreId, serviceArea) ? (
                    <Badge variant="success">Compatible</Badge>
                  ) : (
                    <Badge variant="warning">Different Store Area</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {address.firstName} {address.lastName}, {address.street1}
                  {address.street2 ? `, ${address.street2}` : ""}, {address.city},{" "}
                  {address.postalCode}, {address.country}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(address.id)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                  >
                    Edit
                  </button>
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                      More actions
                    </summary>
                    <div className="absolute left-0 top-full z-10 mt-1 flex min-w-44 flex-col gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-950">
                      {!address.isDefault ? (
                        <button
                          type="button"
                          onClick={() => void setDefault(address.id)}
                          className="rounded px-2 py-1.5 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Set as Default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void remove(address.id)}
                        className="rounded px-2 py-1.5 text-left text-xs text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
