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
    <div className="mx-auto grid min-w-0 w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-6 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-2 lg:space-y-2">
        <p className="text-xs text-muted-foreground lg:text-[13px]">Hello, {greetingName}</p>
        <div className="-mx-4 min-w-0 w-auto max-w-none sm:-mx-6 lg:mx-0 lg:w-full">
          <AccountSidebar locale={locale} />
        </div>
      </div>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
