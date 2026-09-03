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
  navItems: NavItem[];
  siteName?: string;
  announcementText?: string | null;
};

export function Navbar({
  locale,
  navItems,
  siteName = "BS Commerce",
  announcementText,
}: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const desktopNavItems = useMemo(
    () => navItems.filter((i) => i.showInDesktopNav !== false),
    [navItems],
  );
  const drawerNavItems = useMemo(
    () => navItems.filter((i) => i.showInMobileDrawer !== false),
    [navItems],
  );
  const cartCountLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <div className="w-full flex flex-col">
      {/* ─── TIER 1: Top Utility & Announcement Bar ─── */}
      <div className="border-b border-border/60 bg-muted/40 text-[11px] sm:text-xs text-muted-foreground">
        <div className="mx-auto flex h-8 w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Live Promo Announcement */}
          <div className="flex min-w-0 items-center gap-2 font-medium text-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" aria-hidden="true" />
            <span className="truncate">
              {announcementText || "Official Brand Warranty • 0% EMI up to 36 Months • Free Nationwide Delivery"}
            </span>
          </div>

          {/* Right: Quick Utility Links & Theme/Locale Controls */}
          <div className="hidden shrink-0 items-center gap-3.5 sm:flex">
            <Link
              href={`/${locale}/showrooms`}
              className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Our Showrooms</span>
            </Link>

            <Link
              href={`/${locale}/track-order`}
              className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span>Track Order</span>
            </Link>

            <Link
              href={`/${locale}/faq`}
              className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
            >
              <span>Help & FAQ</span>
            </Link>

            <div className="h-3 w-[1px] bg-border/80" aria-hidden="true" />
            <LocaleSwitcher locale={locale} dataTestId="locale-switcher-header" />
            <ThemeSwitcher idPrefix="header" />
          </div>
        </div>
      </div>

      {/* ─── TIER 2: Main Brand & Action Header ─── */}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-2xs transition hover:bg-muted lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 text-foreground transition hover:opacity-90"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-xs font-black tracking-wider text-primary-foreground shadow-sm">
              BS
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none sm:text-base tracking-tight">
                {siteName}
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-block mt-0.5">
                Authentic Tech Store
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Full-width responsive Search Bar */}
        <div className="hidden min-w-0 flex-1 max-w-xl md:block mx-3 lg:mx-6">
          <SearchBar locale={locale} />
        </div>

        {/* Right: Actions Cluster (Search toggle, Account, Cart) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSearchExpanded((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground md:hidden"
            aria-expanded={isSearchExpanded}
            aria-label="Search products"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M13.5 13.5L17 17M9 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* User Account / Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={`/${locale}/account`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-muted"
                title="Account Dashboard"
              >
                <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden sm:inline-flex rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground"
                title="Sign Out"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-muted"
              title="Sign In to Your Account"
            >
              <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Cart Button with Counter Badge */}
          <Link
            href={`/${locale}/cart`}
            className="relative inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs transition hover:bg-primary/90"
            aria-label={`Cart with ${itemCount} items`}
            title="Shopping Cart"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-background px-1 text-[10px] font-bold text-foreground">
              {cartCountLabel}
            </span>
          </Link>
        </div>
      </div>

      {/* ─── TIER 3: Sleek Horizontal Category Navigation Bar ─── */}
      <div className="border-t border-border/60 bg-muted/15">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
          {/* Scrollable Category Navigation (Never Overflows!) */}
          <nav
            aria-label="Category navigation"
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1.5 no-scrollbar scroll-smooth whitespace-nowrap"
          >
            {desktopNavItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Store Location Selector on md+ */}
          {features.multiStore ? (
            <div className="hidden shrink-0 border-l border-border/60 pl-3 md:block py-1">
              <StoreSelector />
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Location Selector Bar */}
      {features.multiStore ? (
        <div className="border-t border-border/60 bg-muted/25 px-3 py-1.5 md:hidden">
          <StoreSelector />
        </div>
      ) : null}

      {/* Expandable Search Overlay for Mobile */}
      {isSearchExpanded ? (
        <div className="absolute inset-x-0 top-full z-40 bg-background/95 backdrop-blur-md p-3 border-b border-border shadow-lg md:hidden">
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
      ) : null}

      {/* Slide-out Mobile Menu Drawer */}
      <MobileMenu
        locale={locale}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={drawerNavItems}
        cartCount={itemCount}
      />
    </div>
  );
}
