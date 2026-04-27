"use client";

import { use } from "react";
import { RegisterForm } from "@/components/auth/register-form";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = use(params);

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Create Account</h1>
      <RegisterForm locale={locale} />
    </main>
  );
}
