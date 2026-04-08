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
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          {...form.register("email")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Phone</span>
        <input
          {...form.register("phone")}
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
      <label className="block space-y-1">
        <span className="text-sm font-medium">Confirm Password</span>
        <input
          type="password"
          {...form.register("confirmPassword")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Register
      </button>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href={`/${locale}/auth/login`} className="underline">
          Login
        </Link>
      </p>

      {features.socialLogin ? <SocialLoginButtons /> : null}
    </form>
  );
}
