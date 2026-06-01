"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  deleteWishlistItem,
  getWishlistItemsPage,
  type WishlistItem,
} from "@/lib/api/wishlist";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Product } from "@/lib/types/product";

function productFromEntry(entry: WishlistItem): Product | null {
  if (!entry.product || typeof entry.product === "string") return null;
  if (!entry.product.id || !entry.product.slug) return null;
  return entry.product;
}

export default function AccountWishlistPage() {
  const params = useParams<{ locale: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const locale = params.locale ?? "en";
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingEntryId, setRemovingEntryId] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = 1) => {
      if (!user?.id) return null;
      setIsLoading(true);
      setError(null);
      try {
        const response = await getWishlistItemsPage(user.id, nextPage, 12);
        setItems(response.docs);
        setPage(response.page);
        setTotalPages(response.totalPages || 1);
        return response;
      } catch (e) {
        setError(getApiErrorMessage(e));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const rows = useMemo(
    () =>
      items.flatMap((entry) => {
        const product = productFromEntry(entry);
        return product ? [{ entry, product }] : [];
      }),
    [items],
  );

  async function remove(entryId: string) {
    setError(null);
    setRemovingEntryId(entryId);
    try {
      await deleteWishlistItem(entryId);
      const refreshed = await load(page);
      if (page > 1 && refreshed && refreshed.docs.length === 0) {
        await load(page - 1);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setRemovingEntryId(null);
    }
  }

  if (isAuthLoading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Loading wishlist...</p>;
  }

  if (!user?.id) {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          Please sign in to view your wishlist.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Wishlist</h1>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading wishlist...</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you like and they will appear here."
          actionLabel="Browse products"
          actionHref={`/${locale}/products`}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ entry, product }) => (
              <article key={entry.id} className="space-y-2">
                <div className="rounded-xl border border-border/60 p-2">
                  <ProductCard product={product} locale={locale} />
                </div>
                <button
                  type="button"
                  onClick={() => void remove(entry.id)}
                  disabled={removingEntryId === entry.id}
                  className="w-full rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  {removingEntryId === entry.id ? "Removing..." : "Remove from wishlist"}
                </button>
              </article>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-300">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => void load(page - 1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => void load(page + 1)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
