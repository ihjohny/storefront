"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { features } from "@/lib/config/features";
import { useAuth } from "@/lib/hooks/use-auth";
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
      router.push(redirectTo || `/${locale}/account`);
    } catch {
      setError("Invalid credentials or verification required.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Email or Phone</span>
        <input
          {...form.register("identifier")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          {...form.register("password")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Login
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href={`/${locale}/auth/forgot-password`} className="hover:underline">
          Forgot Password?
        </Link>
        <Link href={`/${locale}/auth/register`} className="hover:underline">
          Register
        </Link>
      </div>

      {features.socialLogin ? <SocialLoginButtons /> : null}
    </form>
  );
}
