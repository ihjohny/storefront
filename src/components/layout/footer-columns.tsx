"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { normalizeCmsPathToHref } from "@/lib/utils/normalize-cms-href";
import {
  shouldShowFooterLink,
  type FooterLinkVisibility,
} from "@/lib/utils/footer-link-visibility";

export type FooterLink = {
  label: string;
  href: string;
  visibility: FooterLinkVisibility;
};
export type FooterColumn = { title: string; links: FooterLink[] };

type FooterColumnsProps = {
  locale: string;
  columns: FooterColumn[];
};

export function FooterColumns({ locale, columns }: FooterColumnsProps) {
  const { isAuthenticated } = useAuth();

  const displayColumns = useMemo(() => {
    return columns
      .map((col) => ({
        ...col,
        links: col.links.filter((link) =>
          shouldShowFooterLink(link.visibility, isAuthenticated),
        ),
      }))
      .filter((col) => col.links.length > 0);
  }, [columns, isAuthenticated]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {displayColumns.map((column) => (
        <section key={column.title} className="space-y-3">
          <h2 className="text-sm font-semibold">{column.title}</h2>
          <ul className="space-y-2">
            {column.links.map((link) => (
              <li key={`${column.title}-${link.href}-${link.label}`}>
                <Link
                  href={normalizeCmsPathToHref(link.href, locale)}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
