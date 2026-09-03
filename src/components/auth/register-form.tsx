"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { features } from "@/lib/config/features";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  buildRegisterFormSchema,
  getRegisterIdentifierFieldLayout,
  registerFormDefaultValues,
  type RegisterFormInput,
} from "@/lib/config/register-form-schema";
import {
  authErrorClass,
  authFieldClass,
  authInlineLinkClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-form-classes";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

function buildDisplayNameForApi(first: string, last: string) {
  const t = [first.trim(), last.trim()].filter(Boolean).join(" ");
  return t || first.trim() || undefined;
}

export function RegisterForm({ locale }: { locale: string }) {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { showEmail, showPhone } = getRegisterIdentifierFieldLayout();
  const registerSchema = useMemo(() => buildRegisterFormSchema(), []);

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: registerFormDefaultValues,
  });

  async function onSubmit(values: RegisterFormInput) {
    setError(null);
    try {
      await registerUser({
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim() || undefined,
        displayName: buildDisplayNameForApi(values.firstName, values.lastName),
      });
      const dest = `/${locale}/account`;
      router.push(dest);
      if (typeof window !== "undefined" && window.location) {
        window.location.assign(dest);
      }
    } catch {
      setError("Unable to create account. Please check your inputs.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <label className="block space-y-1">
        <span className={authLabelClass}>First name</span>
        <input
          type="text"
          autoComplete="given-name"
          {...form.register("firstName")}
          className={authFieldClass}
        />
        {form.formState.errors.firstName ? (
          <span className="text-xs text-destructive">
            {form.formState.errors.firstName.message}
          </span>
        ) : null}
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>
          Last name <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          type="text"
          autoComplete="family-name"
          {...form.register("lastName")}
          className={authFieldClass}
        />
        {form.formState.errors.lastName ? (
          <span className="text-xs text-destructive">
            {form.formState.errors.lastName.message}
          </span>
        ) : null}
      </label>

      {showEmail ? (
        <label className="block space-y-1">
          <span className={authLabelClass}>Email</span>
          <input
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className={authFieldClass}
          />
          {form.formState.errors.email ? (
            <span className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </label>
      ) : null}

      {showPhone ? (
        <label className="block space-y-1">
          <span className={authLabelClass}>Phone</span>
          <input
            type="tel"
            autoComplete="tel"
            {...form.register("phone")}
            className={authFieldClass}
          />
          {form.formState.errors.phone ? (
            <span className="text-xs text-destructive">
              {form.formState.errors.phone.message}
            </span>
          ) : null}
        </label>
      ) : null}

      <label className="block space-y-1">
        <span className={authLabelClass}>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
          className={authFieldClass}
        />
        {form.formState.errors.password ? (
          <span className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </span>
        ) : null}
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>Confirm Password</span>
        <input
          type="password"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
          className={authFieldClass}
        />
        {form.formState.errors.confirmPassword ? (
          <span className="text-xs text-destructive">
            {form.formState.errors.confirmPassword.message}
          </span>
        ) : null}
      </label>

      {error ? <p className={authErrorClass}>{error}</p> : null}

      <button type="submit" className={authPrimaryButtonClass}>
        Register
      </button>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/${locale}/auth/login`} className={authInlineLinkClass}>
          Login
        </Link>
      </p>

      {features.socialLogin ? <SocialLoginButtons /> : null}
    </form>
  );
}
