import Link from "next/link";
import { verifyEmailToken } from "@/lib/api/auth";

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  params,
  searchParams,
}: VerifyEmailPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const token = firstParam(query.token);

  if (!token) {
    return (
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-10 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Verification failed</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Missing verification token.
        </p>
      </main>
    );
  }

  try {
    await verifyEmailToken(token);
    return (
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-10 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Email verified successfully</h1>
        <Link
          href={`/${locale}/account`}
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Go to Account
        </Link>
      </main>
    );
  } catch {
    return (
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-10 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Verification failed</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Token is invalid or expired.
        </p>
        <Link
          href={`/${locale}/account/settings`}
          className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          Resend Verification
        </Link>
      </main>
    );
  }
}
