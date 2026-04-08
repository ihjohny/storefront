"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SearchBar } from "@/components/layout/search-bar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCart } from "@/lib/hooks/use-cart";

export type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  locale: string;
  navItems: NavItem[];
};

export function Navbar({ locale, navItems }: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const safeItems = useMemo(() => navItems.slice(0, 8), [navItems]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="text-base font-semibold tracking-tight">
          BS Commerce
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-4 text-sm md:flex"
        >
          {safeItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
          <div className="w-full max-w-sm">
            <SearchBar locale={locale} />
          </div>
          <LocaleSwitcher locale={locale} dataTestId="locale-switcher-header" />
          <Link
            href={`/${locale}/cart`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
          >
            Cart ({itemCount})
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={`/${locale}/account`}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
              >
                Login
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm md:hidden dark:border-slate-700"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          Menu
        </button>
      </div>

      <MobileMenu
        locale={locale}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={safeItems}
        cartCount={itemCount}
      />
    </>
  );
}
