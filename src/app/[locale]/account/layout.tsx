import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { AccountSidebar } from "@/components/account/account-sidebar";

type AccountLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;

  if (!token) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/account`);
  }

  const me = await getMe(`payload-token=${token}`);
  if (!me.user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/account`);
  }

  const greetingName = me.user.displayName || me.user.email || "Customer";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">Hello, {greetingName}</p>
        <AccountSidebar locale={locale} />
      </div>
      <main>{children}</main>
    </div>
  );
}
