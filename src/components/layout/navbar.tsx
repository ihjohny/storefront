"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { SearchBar } from "@/components/layout/search-bar";
import { StoreSelector } from "@/components/layout/store-selector";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { features } from "@/lib/config/features";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCart } from "@/lib/hooks/use-cart";

export type NavItem = {
  label: string;
  href: string;
  /** CMS: default true. When false, hidden from horizontal nav (md+). */
  showInDesktopNav?: boolean;
  /** CMS: default true. When false, hidden from mobile slide-out menu. */
  showInMobileDrawer?: boolean;
};

type NavbarProps = {
  locale: string;
  /** Primary links from CMS: horizontal bar (md+) vs mobile drawer per row flags. */
  navItems: NavItem[];
};

export function Navbar({ locale, navItems }: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const desktopNavItems = useMemo(
    () => navItems.filter((i) => i.showInDesktopNav !== false).slice(0, 8),
    [navItems],
  );
  const drawerNavItems = useMemo(
    () => navItems.filter((i) => i.showInMobileDrawer !== false).slice(0, 8),
    [navItems],
  );
  const cartCountLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <>
      <div className="relative w-full">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between gap-3 lg:gap-5">
            {/* Left: Brand Logo & Desktop Nav Links */}
            <div className="flex shrink-0 items-center gap-4 lg:gap-6">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground transition hover:opacity-90"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-2xs">
                  BS
                </span>
                <span className="hidden font-semibold sm:inline-block">Commerce</span>
              </Link>

              {/* Primary Navigation Links (Desktop) */}
              <nav
                aria-label="Primary navigation"
                className="hidden items-center gap-1 text-sm font-medium lg:flex"
              >
                {desktopNavItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Middle: Integrated Search Bar */}
            <div className="hidden min-w-[180px] flex-1 max-w-xs xl:max-w-md md:block">
              <SearchBar locale={locale} />
            </div>

            {/* Right: Actions & Controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchExpanded((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground md:hidden"
                aria-expanded={isSearchExpanded}
                aria-label="Toggle search"
                title="Search"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M13.5 13.5L17 17M9 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Switchers (Desktop) */}
              <div className="hidden items-center gap-1.5 xl:flex">
                <LocaleSwitcher locale={locale} dataTestId="locale-switcher-header" />
                <ThemeSwitcher idPrefix="header" />
              </div>

              {/* Track Order Button */}
              <Link
                href={`/${locale}/track-order`}
                className="hidden shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted md:inline-flex"
                title="Track Order"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-muted-foreground" fill="none" aria-hidden="true">
                  <path
                    d="M3 4h14v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Zm0 4h14M8 12h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Track Order</span>
              </Link>

              {/* Cart Button */}
              <Link
                href={`/${locale}/cart`}
                className="relative inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted"
                aria-label={`Cart with ${itemCount} items`}
                title="Shopping Cart"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-muted-foreground" fill="none" aria-hidden="true">
                  <path
                    d="M3 4h1.2c.4 0 .75.28.84.67L5.4 6H16l-1.2 5.2a1 1 0 0 1-.98.8H7.2a1 1 0 0 1-.98-.8L4.5 4.7M8 16.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {cartCountLabel}
                </span>
              </Link>

              {/* Desktop / Tablet Auth Buttons */}
              {isAuthenticated ? (
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  <Link
                    href={`/${locale}/account`}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  <Link
                    href={`/${locale}/auth/login`}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-2xs transition hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile / Tablet Menu Trigger */}
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-2xs transition hover:bg-muted lg:hidden"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open navigation menu"
                title="Menu"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M3 5.5h14M3 10h14M3 14.5h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Optional Multi-Store Bar */}
          {features.multiStore ? (
            <div className="min-w-0 border-t border-border/60 pt-2 sm:pt-2.5">
              <StoreSelector />
            </div>
          ) : null}
        </div>

        {/* Expandable Search Overlay for Mobile */}
        {isSearchExpanded ? (
          <div className="absolute inset-x-0 top-full z-40 md:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6">
              <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <SearchBar
                    locale={locale}
                    focusOnMount
                    onSearchComplete={() => setIsSearchExpanded(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(false)}
                    className="shrink-0 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <MobileMenu
        locale={locale}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={drawerNavItems}
        cartCount={itemCount}
      />
    </>
  );
}
