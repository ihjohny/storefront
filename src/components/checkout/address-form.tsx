"use client";

import { useEffect, useRef } from "react";
import { useForm, useFormState } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const emailOrEmpty = z.union([
  z.literal(""),
  z.string().email("Enter a valid email"),
]);

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street1: z.string().min(1, "Street is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required").max(2, "Use ISO country code"),
  phone: z.string().optional(),
  guestEmail: emailOrEmpty,
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * Locks checkout fields to match the header service-area selection only at the levels the shopper chose:
 * - Country + region (subdivision) always locked when geography checkout is active.
 * - City locked only if they picked a specific locality; otherwise they enter street-level / local area detail.
 */
export type ServiceAreaReadonlyFields = {
  countryIso: string;
  region: string;
  /** When set, user chose a locality in the header — city matches it. When null, only region is fixed. */
  localityName: string | null;
};

type AddressFormProps = {
  requireGuestEmail?: boolean;
  defaultValues?: Partial<AddressFormValues>;
  serviceAreaReadonly?: ServiceAreaReadonlyFields;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
};

export function AddressForm({
  requireGuestEmail = false,
  defaultValues,
  serviceAreaReadonly,
  isSubmitting = false,
  submitLabel = "Continue to Shipping",
  onSubmit,
}: AddressFormProps) {
  const cityLocked = Boolean(serviceAreaReadonly?.localityName);
  const regionLocked = Boolean(serviceAreaReadonly);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: defaultValues?.label ?? "Home",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      street1: defaultValues?.street1 ?? "",
      street2: defaultValues?.street2 ?? "",
      city:
        (cityLocked ? serviceAreaReadonly?.localityName : undefined) ??
        defaultValues?.city ??
        "",
      state: serviceAreaReadonly?.region ?? defaultValues?.state ?? "",
      postalCode: defaultValues?.postalCode ?? "",
      country: serviceAreaReadonly?.countryIso ?? defaultValues?.country ?? "BD",
      phone: defaultValues?.phone ?? "",
      guestEmail: defaultValues?.guestEmail ?? "",
    },
  });

  const { errors, isSubmitted } = useFormState({ control: form.control });
  const lastGeoSyncKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!serviceAreaReadonly) {
      lastGeoSyncKeyRef.current = null;
      return;
    }
    const key = [
      serviceAreaReadonly.countryIso,
      serviceAreaReadonly.region,
      serviceAreaReadonly.localityName ?? "",
    ].join("\0");
    if (lastGeoSyncKeyRef.current === key) {
      return;
    }
    lastGeoSyncKeyRef.current = key;
    form.setValue("country", serviceAreaReadonly.countryIso, {
      shouldValidate: false,
      shouldDirty: false,
    });
    form.setValue("state", serviceAreaReadonly.region, {
      shouldValidate: false,
      shouldDirty: false,
    });
    if (
      serviceAreaReadonly.localityName != null &&
      serviceAreaReadonly.localityName !== ""
    ) {
      form.setValue("city", serviceAreaReadonly.localityName, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form instance stable; sync geo-only
  }, [
    serviceAreaReadonly?.countryIso,
    serviceAreaReadonly?.region,
    serviceAreaReadonly?.localityName,
  ]);

  async function handleSubmit(values: AddressFormValues) {
    if (requireGuestEmail && !values.guestEmail?.trim()) {
      form.setError("guestEmail", { message: "Guest email is required" });
      return;
    }

    await onSubmit(values);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {isSubmitted && hasErrors ? (
        <p
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
        >
          Please review the highlighted fields. Street address is required; guest checkout also
          requires a valid email.
        </p>
      ) : null}
      {regionLocked ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          {cityLocked
            ? "Country, region, and city/area match your delivery selection. Enter street and postal code below."
            : "Country and region match your delivery selection. Enter your local area, street, and postal code below."}
        </p>
      ) : null}

      {requireGuestEmail ? (
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            {...form.register("guestEmail")}
            type="email"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.guestEmail ? (
            <span className="text-xs text-rose-600">{errors.guestEmail.message}</span>
          ) : null}
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Label</span>
          <input
            {...form.register("label")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.label ? <span className="text-xs text-rose-600">{errors.label.message}</span> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Phone</span>
          <input
            {...form.register("phone")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">First name</span>
          <input
            {...form.register("firstName")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.firstName ? (
            <span className="text-xs text-rose-600">{errors.firstName.message}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Last name</span>
          <input
            {...form.register("lastName")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.lastName ? (
            <span className="text-xs text-rose-600">{errors.lastName.message}</span>
          ) : null}
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Street 1</span>
        <input
          {...form.register("street1")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        {errors.street1 ? <span className="text-xs text-rose-600">{errors.street1.message}</span> : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Street 2</span>
        <input
          {...form.register("street2")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">
            City / local area
            {cityLocked ? " (from your selection)" : ""}
          </span>
          <input
            {...form.register("city")}
            readOnly={cityLocked}
            aria-readonly={cityLocked}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 read-only:pointer-events-none read-only:bg-slate-100 dark:read-only:bg-slate-900"
          />
          {errors.city ? <span className="text-xs text-rose-600">{errors.city.message}</span> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Region</span>
          <input
            {...form.register("state")}
            readOnly={regionLocked}
            aria-readonly={regionLocked}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 read-only:pointer-events-none read-only:bg-slate-100 dark:read-only:bg-slate-900"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Postal code</span>
          <input
            {...form.register("postalCode")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.postalCode ? (
            <span className="text-xs text-rose-600">{errors.postalCode.message}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Country (ISO)</span>
          <input
            {...form.register("country")}
            maxLength={2}
            readOnly={regionLocked}
            aria-readonly={regionLocked}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-950 read-only:pointer-events-none read-only:bg-slate-100 dark:read-only:bg-slate-900"
          />
          {errors.country ? (
            <span className="text-xs text-rose-600">{errors.country.message}</span>
          ) : null}
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
