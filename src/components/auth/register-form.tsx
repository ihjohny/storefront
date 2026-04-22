"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { features } from "@/lib/config/features";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  authErrorClass,
  authFieldClass,
  authInlineLinkClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-form-classes";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

const registerSchema = z
  .object({
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Email or phone is required",
    path: ["email"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  locale: string;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      await register({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
      });
      router.push(`/${locale}/account`);
    } catch {
      setError("Unable to create account. Please check your inputs.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <label className="block space-y-1">
        <span className={authLabelClass}>Email</span>
        <input
          type="email"
          autoComplete="email"
          {...form.register("email")}
          className={authFieldClass}
        />
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>Phone</span>
        <input
          type="tel"
          autoComplete="tel"
          {...form.register("phone")}
          className={authFieldClass}
        />
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>Password</span>
        <input
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
          className={authFieldClass}
        />
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>Confirm Password</span>
        <input
          type="password"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
          className={authFieldClass}
        />
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
