"use client";

import Link from "next/link";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SearchBar } from "@/components/layout/search-bar";
import { useAuth } from "@/lib/hooks/use-auth";

export type MobileNavItem = {
  label: string;
  href: string;
};

type MobileMenuProps = {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  navItems: MobileNavItem[];
  cartCount: number;
};

export function MobileMenu({
  locale,
  isOpen,
  onClose,
  navItems,
  cartCount,
}: MobileMenuProps) {
  const { isAuthenticated, logout } = useAuth();

  async function handleLogout() {
    await logout();
    onClose();
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 xl:hidden" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="flex h-full w-full max-w-xs flex-col gap-4 bg-white p-4 shadow-xl dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Menu</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
                >
                  Close
                </button>
              </div>

              <nav aria-label="Mobile menu" className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={onClose}
                    className="rounded-md px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <SearchBar
                locale={locale}
                placeholder="Search products"
                onSearchComplete={onClose}
              />

              <Link
                href={`/${locale}/cart`}
                onClick={onClose}
                className="rounded-md px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Cart ({cartCount})
              </Link>

              <div className="pt-2">
                <LocaleSwitcher locale={locale} dataTestId="locale-switcher-menu" />
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={`/${locale}/account`}
                      onClick={onClose}
                      className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm dark:border-slate-700"
                    >
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={onClose}
                      className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm dark:border-slate-700"
                    >
                      Login
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      onClick={onClose}
                      className="rounded-md bg-slate-900 px-3 py-2 text-center text-sm text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
