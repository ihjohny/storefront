"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
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
};

type NavbarProps = {
  locale: string;
  navItems: NavItem[];
};

export function Navbar({ locale, navItems }: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const safeItems = useMemo(() => navItems.slice(0, 8), [navItems]);
  const cartCountLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <>
      <div className="relative">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            className="shrink-0 text-base font-semibold tracking-tight"
          >
            BS Commerce
          </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden min-w-0 items-center gap-3 text-sm md:flex"
        >
          {safeItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md px-2 py-1 transition hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 xl:flex">
          <div className="w-full max-w-sm">
            <SearchBar locale={locale} />
          </div>
          <LocaleSwitcher locale={locale} dataTestId="locale-switcher-header" />
          <ThemeSwitcher idPrefix="header" />
          <Link
            href={`/${locale}/cart`}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Cart ({itemCount})
          </Link>
          <Link
            href={`/${locale}/track-order`}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          >
            Track Order
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={`/${locale}/account`}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Login
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex xl:hidden">
          <button
            type="button"
            onClick={() => setIsSearchExpanded((prev) => !prev)}
            className="inline-flex h-9 min-w-28 items-center gap-2 rounded-md border border-border px-2.5 text-sm text-muted-foreground"
            aria-expanded={isSearchExpanded}
            aria-label="Toggle search panel"
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
            <span>Search</span>
          </button>

          <Link
            href={`/${locale}/cart`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            aria-label={`Cart with ${itemCount} items`}
            title="Cart"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M3 4h1.2c.4 0 .75.28.84.67L5.4 6H16l-1.2 5.2a1 1 0 0 1-.98.8H7.2a1 1 0 0 1-.98-.8L4.5 4.7M8 16.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
              {cartCountLabel}
            </span>
          </Link>

          <Menu as="div" className="relative">
            <MenuButton
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
              aria-label="Profile options"
              title={isAuthenticated ? "Account options" : "Sign in options"}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </MenuButton>
            <MenuItems className="absolute right-0 z-40 mt-2 w-44 rounded-md border border-border bg-card p-1 text-sm shadow-lg outline-none">
              {isAuthenticated ? (
                <>
                  <MenuItem>
                    <Link
                      href={`/${locale}/account`}
                      className="block rounded px-2 py-1.5 hover:bg-muted"
                    >
                      Account
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href={`/${locale}/account/orders`}
                      className="block rounded px-2 py-1.5 hover:bg-muted"
                    >
                      My Orders
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="block w-full rounded px-2 py-1.5 text-left hover:bg-muted"
                    >
                      Logout
                    </button>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem>
                    <Link
                      href={`/${locale}/auth/login`}
                      className="block rounded px-2 py-1.5 hover:bg-muted"
                    >
                      Login
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href={`/${locale}/auth/register`}
                      className="block rounded px-2 py-1.5 hover:bg-muted"
                    >
                      Register
                    </Link>
                  </MenuItem>
                </>
              )}
              <div className="mt-1 border-t border-border pt-1">
                <MenuItem>
                  <Link
                    href={`/${locale}/track-order`}
                    className="block rounded px-2 py-1.5 hover:bg-muted"
                  >
                    Track Order
                  </Link>
                </MenuItem>
              </div>
              <div className="mt-1 border-t border-border px-2 py-2">
                <div className="flex flex-col gap-2">
                  <ThemeSwitcher idPrefix="header-compact" />
                  <LocaleSwitcher locale={locale} dataTestId="locale-switcher-header-compact" />
                </div>
              </div>
            </MenuItems>
          </Menu>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsSearchExpanded((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            aria-expanded={isSearchExpanded}
            aria-label="Toggle search panel"
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

          <Link
            href={`/${locale}/cart`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            aria-label={`Cart with ${itemCount} items`}
            title="Cart"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M3 4h1.2c.4 0 .75.28.84.67L5.4 6H16l-1.2 5.2a1 1 0 0 1-.98.8H7.2a1 1 0 0 1-.98-.8L4.5 4.7M8 16.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
              {cartCountLabel}
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
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

        <button
          type="button"
          className="hidden rounded-md border border-border px-3 py-1.5 text-sm md:hidden"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          Menu
        </button>
        </div>
        {features.multiStore ? (
          <div className="min-w-0 border-t border-border/60 pt-2 sm:pt-3">
            <StoreSelector />
          </div>
        ) : null}
        </div>

        {isSearchExpanded ? (
          <div className="absolute inset-x-0 top-full z-40 md:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <SearchBar
                    locale={locale}
                    focusOnMount
                    onSearchComplete={() => setIsSearchExpanded(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(false)}
                    className="rounded-md border border-border px-2 py-2 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isSearchExpanded ? (
          <div className="absolute inset-x-0 top-full z-40 hidden md:block xl:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <SearchBar
                    locale={locale}
                    focusOnMount
                    onSearchComplete={() => setIsSearchExpanded(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(false)}
                    className="rounded-md border border-border px-2 py-2 text-xs"
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
        navItems={safeItems}
        cartCount={itemCount}
      />
    </>
  );
}
