"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type AccountSidebarProps = {
  locale: string;
};

const navItems = [
  { label: "Dashboard", href: "account" },
  { label: "Orders", href: "account/orders" },
  { label: "Addresses", href: "account/addresses" },
  { label: "Wishlist", href: "account/wishlist" },
  { label: "Settings", href: "account/settings" },
] as const;

export function AccountSidebar({ locale }: AccountSidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const nav = navRef.current;
    const active = activeTabRef.current;
    if (!nav || !active) return;
    const target =
      active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2;
    nav.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [pathname]);

  return (
    <aside
      className="min-w-0 w-full max-w-full overflow-x-clip rounded-none border-x-0 border-y border-border/80 bg-muted/50 shadow-sm backdrop-blur-[2px] dark:border-border dark:bg-muted/30 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.35)] lg:overflow-visible lg:rounded-lg lg:border lg:border-border lg:p-2 lg:shadow-sm lg:backdrop-blur-none"
    >
      <nav
        ref={navRef}
        className="flex max-w-full flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-px-4 touch-pan-x sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden lg:flex lg:max-w-none lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:py-0 lg:snap-none lg:touch-auto"
        aria-label="Account"
      >
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.href}
              ref={isActive ? activeTabRef : undefined}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-9 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-md border-2 px-3.5 text-sm font-medium tracking-tight transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] lg:flex lg:min-h-8 lg:w-full lg:justify-start lg:border lg:px-2 lg:py-1.5 lg:text-[13px] lg:leading-snug lg:tracking-normal lg:whitespace-normal ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background/80 text-muted-foreground shadow-none hover:border-primary/60 hover:bg-muted hover:text-foreground active:bg-muted/80 dark:bg-transparent dark:text-muted-foreground dark:hover:bg-muted/50"
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
