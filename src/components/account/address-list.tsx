"use client";

import { useMemo, useState } from "react";
import {
  createAddress,
  deleteAddress,
  updateAddress,
  type Address,
  type AddressInput,
} from "@/lib/api/addresses";
import { AddressForm, type AddressFormValues } from "@/components/checkout/address-form";
import { Badge } from "@/components/shared/badge";

type AddressListProps = {
  addresses: Address[];
  userId: string;
  onUpdated: () => Promise<void>;
};

function toInput(values: AddressFormValues, userId: string): AddressInput {
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
    phone: values.phone || null,
    isDefault: false,
  };
}

export function AddressList({ addresses, userId, onUpdated }: AddressListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAddressId = useMemo(
    () => addresses.find((item) => item.isDefault)?.id || null,
    [addresses],
  );

  async function createNew(values: AddressFormValues) {
    setIsSubmitting(true);
    try {
      await createAddress(toInput(values, userId));
      setIsCreating(false);
      await onUpdated();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateExisting(id: string, values: AddressFormValues) {
    setIsSubmitting(true);
    try {
      await updateAddress(id, toInput(values, userId));
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
          <AddressForm isSubmitting={isSubmitting} onSubmit={createNew} submitLabel="Save Address" />
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
                onSubmit={(values) => updateExisting(address.id, values)}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{address.label}</p>
                  {address.isDefault ? <Badge variant="info">Default</Badge> : null}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {address.firstName} {address.lastName}, {address.street1}
                  {address.street2 ? `, ${address.street2}` : ""}, {address.city},{" "}
                  {address.postalCode}, {address.country}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(address.id)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(address.id)}
                    className="rounded-md border border-rose-300 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-800 dark:text-rose-300"
                  >
                    Delete
                  </button>
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => void setDefault(address.id)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                    >
                      Set as Default
                    </button>
                  ) : null}
                  {defaultAddressId === address.id ? null : null}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
