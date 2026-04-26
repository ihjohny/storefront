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
  authFooterLinkClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-form-classes";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone required"),
  password: z.string().min(1, "Password required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  locale: string;
  redirectTo?: string;
};

export function LoginForm({ locale, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await login(values.identifier, values.password);
      const dest = redirectTo || `/${locale}/account`;
      router.push(dest);
      router.refresh();
    } catch {
      setError("Invalid credentials or verification required.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <label className="block space-y-1">
        <span className={authLabelClass}>Email or Phone</span>
        <input
          {...form.register("identifier")}
          autoComplete="username"
          className={authFieldClass}
        />
      </label>
      <label className="block space-y-1">
        <span className={authLabelClass}>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
          className={authFieldClass}
        />
      </label>

      {error ? <p className={authErrorClass}>{error}</p> : null}

      <button type="submit" className={authPrimaryButtonClass}>
        Login
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href={`/${locale}/auth/forgot-password`} className={authFooterLinkClass}>
          Forgot Password?
        </Link>
        <Link href={`/${locale}/auth/register`} className={authFooterLinkClass}>
          Register
        </Link>
      </div>

      {features.socialLogin ? <SocialLoginButtons /> : null}
    </form>
  );
}
