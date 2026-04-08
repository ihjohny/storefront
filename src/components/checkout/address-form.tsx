"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  guestEmail: z.string().email("Enter a valid email").optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

type AddressFormProps = {
  requireGuestEmail?: boolean;
  defaultValues?: Partial<AddressFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
};

export function AddressForm({
  requireGuestEmail = false,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Continue to Shipping",
  onSubmit,
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: defaultValues?.label ?? "Home",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      street1: defaultValues?.street1 ?? "",
      street2: defaultValues?.street2 ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      postalCode: defaultValues?.postalCode ?? "",
      country: defaultValues?.country ?? "BD",
      phone: defaultValues?.phone ?? "",
      guestEmail: defaultValues?.guestEmail ?? "",
    },
  });

  async function handleSubmit(values: AddressFormValues) {
    if (requireGuestEmail && !values.guestEmail) {
      form.setError("guestEmail", { message: "Guest email is required" });
      return;
    }

    await onSubmit(values);
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <span className="text-sm font-medium">City</span>
          <input
            {...form.register("city")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {errors.city ? <span className="text-xs text-rose-600">{errors.city.message}</span> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">State</span>
          <input
            {...form.register("state")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-950"
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
