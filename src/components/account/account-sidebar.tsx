"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AccountSidebarProps = {
  locale: string;
};

const navItems = [
  { label: "Dashboard", href: "account" },
  { label: "Orders", href: "account/orders" },
  { label: "Addresses", href: "account/addresses" },
  { label: "Settings", href: "account/settings" },
] as const;

export function AccountSidebar({ locale }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
