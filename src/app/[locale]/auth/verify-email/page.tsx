import Link from "next/link";
import {
  authOutlineButtonClass,
  authPrimaryButtonInlineClass,
} from "@/components/auth/auth-form-classes";
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
        <h1 className="text-2xl font-semibold text-foreground">Verification failed</h1>
        <p className="text-sm text-muted-foreground">Missing verification token.</p>
      </main>
    );
  }

  try {
    await verifyEmailToken(token);
    return (
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-10 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground">Email verified successfully</h1>
        <Link href={`/${locale}/account`} className={authPrimaryButtonInlineClass}>
          Go to Account
        </Link>
      </main>
    );
  } catch {
    return (
      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-10 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground">Verification failed</h1>
        <p className="text-sm text-muted-foreground">Token is invalid or expired.</p>
        <Link href={`/${locale}/account/settings`} className={authOutlineButtonClass}>
          Resend Verification
        </Link>
      </main>
    );
  }
}
