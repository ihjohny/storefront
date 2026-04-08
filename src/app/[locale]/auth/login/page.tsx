import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const redirectTo = firstParam(query.redirect) || `/${locale}/account`;

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <LoginForm locale={locale} redirectTo={redirectTo} />
    </main>
  );
}
