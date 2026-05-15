"use client";

import { useEffect, useRef } from "react";
import { useForm, useFormState } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthRequiredIdentifierMode } from "@/lib/auth/auth-required-identifier";
import { LOOSE_EMAIL_FORMAT_RE } from "@/lib/validation/email-format";
import {
  ADDRESS_ISO_COUNTRY_RE,
  ADDRESS_LABEL_RE,
  ADDRESS_PERSON_NAME_RE,
  ADDRESS_PHONE_RE,
  ADDRESS_PLACE_RE,
  ADDRESS_POSTAL_RE,
  ADDRESS_STREET_RE,
} from "@/lib/validation/address-format";
import type { CheckoutGuestContactCopy } from "@/lib/types/checkout-copy";

function requiredTrimmed(
  min: number,
  requiredMsg: string,
  invalidMsg: string,
  pattern: RegExp,
) {
  return z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= min, requiredMsg)
    .refine((v) => pattern.test(v), invalidMsg);
}

const optionalTrimmed = z.string().transform((v) => v.trim()).optional();

const emailOrEmpty = z.union([
  z.literal(""),
  z.string().email("Enter a valid email"),
]);

const addressSchema = z.object({
  label: requiredTrimmed(
    2,
    "Label is required",
    "Label contains invalid characters",
    ADDRESS_LABEL_RE,
  ),
  firstName: requiredTrimmed(
    1,
    "First name is required",
    "First name contains invalid characters",
    ADDRESS_PERSON_NAME_RE,
  ),
  lastName: requiredTrimmed(
    1,
    "Last name is required",
    "Last name contains invalid characters",
    ADDRESS_PERSON_NAME_RE,
  ),
  street1: requiredTrimmed(
    3,
    "Street is required",
    "Street address looks invalid",
    ADDRESS_STREET_RE,
  ),
  street2: optionalTrimmed,
  city: requiredTrimmed(
    2,
    "City is required",
    "City/local area looks invalid",
    ADDRESS_PLACE_RE,
  ),
  state: optionalTrimmed.refine((v) => !v || ADDRESS_PLACE_RE.test(v), "Region looks invalid"),
  postalCode: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, "Postal code is required")
    .refine((v) => ADDRESS_POSTAL_RE.test(v), "Postal code looks invalid"),
  country: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => ADDRESS_ISO_COUNTRY_RE.test(v), "Use a valid 2-letter ISO country code"),
  phone: optionalTrimmed
    .refine((v) => !v || ADDRESS_PHONE_RE.test(v), "Phone looks invalid")
    .refine(
      (v) => !v || (v.replace(/\D/g, "").length >= 5 && v.replace(/\D/g, "").length <= 15),
      "Phone number must contain 5-15 digits",
    ),
  guestEmail: emailOrEmpty,
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export type ServiceAreaReadonlyFields = {
  countryIso: string;
  region: string;
  localityName: string | null;
};

type AddressFormProps = {
  isGuestCheckout?: boolean;
  guestIdentifierMode?: AuthRequiredIdentifierMode;
  guestContactCopy?: CheckoutGuestContactCopy;
  /** Policy reminder shown above guest fields (from dictionary). */
  guestBannerText?: string | null;
  defaultValues?: Partial<AddressFormValues>;
  serviceAreaReadonly?: ServiceAreaReadonlyFields;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
};

export function AddressForm({
  isGuestCheckout = false,
  guestIdentifierMode,
  guestContactCopy,
  guestBannerText,
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
    if (isGuestCheckout && guestIdentifierMode && guestContactCopy) {
      const ge = values.guestEmail?.trim() ?? "";
      const gp = values.phone?.trim() ?? "";
      const emailOk = ge.length > 0 && LOOSE_EMAIL_FORMAT_RE.test(ge);
      const phoneOk = gp.length >= 5;

      if (guestIdentifierMode === "email") {
        if (!emailOk) {
          form.setError("guestEmail", { message: "Enter a valid email." });
          return;
        }
      } else if (guestIdentifierMode === "phone") {
        if (!phoneOk) {
          form.setError("phone", {
            message: "Enter phone (at least 5 characters).",
          });
          return;
        }
      } else {
        if (!emailOk && !phoneOk) {
          form.setError("guestEmail", {
            message: "Enter an email or use phone below (at least 5 characters).",
          });
          form.setError("phone", {
            message: "Enter phone (5+ characters) or provide email above.",
          });
          return;
        }
        if (ge.length > 0 && !emailOk) {
          form.setError("guestEmail", { message: "Enter a valid email." });
          return;
        }
        if (gp.length > 0 && gp.length < 5) {
          form.setError("phone", {
            message: "Phone must be at least 5 characters.",
          });
          return;
        }
      }
    }

    await onSubmit(values);
  }

  const hasErrors = Object.keys(errors).length > 0;
  const showGuestEmail = isGuestCheckout && guestIdentifierMode !== "phone";

  const phoneHint =
    isGuestCheckout && guestContactCopy && guestIdentifierMode
      ? guestIdentifierMode === "phone"
        ? guestContactCopy.fieldHintPhoneRequired
        : guestIdentifierMode === "either"
          ? guestContactCopy.fieldHintPhoneEither
          : undefined
      : undefined;

  const emailHint =
    isGuestCheckout && guestContactCopy && guestIdentifierMode && showGuestEmail
      ? guestIdentifierMode === "email"
        ? guestContactCopy.fieldHintEmailRequired
        : guestContactCopy.fieldHintEmailEither
      : undefined;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {guestBannerText ? (
        <p className="rounded-md border border-border bg-muted/80 px-3 py-2 text-xs text-muted-foreground">
          {guestBannerText}
        </p>
      ) : null}

      {isSubmitted && hasErrors ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
        >
          Please review the highlighted fields.
        </p>
      ) : null}

      {regionLocked ? (
        <p className="rounded-md border border-border bg-muted/80 px-3 py-2 text-xs text-muted-foreground">
          {cityLocked
            ? "Country, region, and city/area match your delivery selection. Enter street and postal code below."
            : "Country and region match your delivery selection. Enter your local area, street, and postal code below."}
        </p>
      ) : null}

      {showGuestEmail ? (
        <div className="space-y-1">
          <label className="block space-y-1">
            <span className="text-sm font-medium">
              Email
              {guestIdentifierMode === "email" ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </span>
            <input
              {...form.register("guestEmail")}
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
            {errors.guestEmail ? (
              <span className="text-xs text-destructive">{errors.guestEmail.message}</span>
            ) : emailHint ? (
              <span className="text-xs text-muted-foreground">{emailHint}</span>
            ) : null}
          </label>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Label</span>
          <input
            {...form.register("label")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.label ? <span className="text-xs text-destructive">{errors.label.message}</span> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Phone
            {isGuestCheckout &&
            guestIdentifierMode &&
            (guestIdentifierMode === "phone" || guestIdentifierMode === "either") ? (
              guestIdentifierMode === "phone" ? (
                <span className="text-destructive"> *</span>
              ) : null
            ) : null}
          </span>
          <input
            {...form.register("phone")}
            type="tel"
            autoComplete="tel"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.phone ? (
            <span className="text-xs text-destructive">{errors.phone.message}</span>
          ) : phoneHint ? (
            <span className="text-xs text-muted-foreground">{phoneHint}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">First name</span>
          <input
            {...form.register("firstName")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.firstName ? (
            <span className="text-xs text-destructive">{errors.firstName.message}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Last name</span>
          <input
            {...form.register("lastName")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.lastName ? (
            <span className="text-xs text-destructive">{errors.lastName.message}</span>
          ) : null}
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Street 1</span>
        <input
          {...form.register("street1")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        {errors.street1 ? <span className="text-xs text-destructive">{errors.street1.message}</span> : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Street 2</span>
        <input
          {...form.register("street2")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground read-only:pointer-events-none read-only:bg-muted"
          />
          {errors.city ? <span className="text-xs text-destructive">{errors.city.message}</span> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Region</span>
          <input
            {...form.register("state")}
            readOnly={regionLocked}
            aria-readonly={regionLocked}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground read-only:pointer-events-none read-only:bg-muted"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Postal code</span>
          <input
            {...form.register("postalCode")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.postalCode ? (
            <span className="text-xs text-destructive">{errors.postalCode.message}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Country (ISO)</span>
          <input
            {...form.register("country")}
            maxLength={2}
            readOnly={regionLocked}
            aria-readonly={regionLocked}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase text-foreground read-only:pointer-events-none read-only:bg-muted"
          />
          {errors.country ? (
            <span className="text-xs text-destructive">{errors.country.message}</span>
          ) : null}
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
