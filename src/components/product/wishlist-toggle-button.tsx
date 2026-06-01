"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createWishlistItem,
  deleteWishlistItem,
  findWishlistItemByProduct,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/client";

type WishlistToggleButtonProps = {
  locale: string;
  productId: string;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        d="M12 20.25l-1.21-1.1C5.14 14.04 2 11.19 2 7.69 2 4.84 4.24 2.6 7.09 2.6c1.62 0 3.18.76 4.16 1.96.98-1.2 2.54-1.96 4.16-1.96C18.26 2.6 20.5 4.84 20.5 7.69c0 3.5-3.14 6.35-8.79 11.46L12 20.25z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistToggleButton({ locale, productId }: WishlistToggleButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.toString();
  const redirectPath = `${pathname}${search ? `?${search}` : ""}`;
  const loginHref = `/${locale}/auth/login?redirect=${encodeURIComponent(redirectPath)}`;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!isAuthenticated || !user?.id) {
        setWishlistItemId(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const entry = await findWishlistItemByProduct(user.id, productId);
        if (!active) return;
        setWishlistItemId(entry?.id ?? null);
      } catch (e) {
        if (!active) return;
        setError(getApiErrorMessage(e));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id, productId]);

  async function toggle() {
    if (!isAuthenticated || !user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      if (wishlistItemId) {
        await deleteWishlistItem(wishlistItemId);
        setWishlistItemId(null);
      } else {
        const created = await createWishlistItem(user.id, productId);
        setWishlistItemId(created.id);
      }
    } catch (e) {
      const message = getApiErrorMessage(e);
      if (message.toLowerCase().includes("already in your wishlist")) {
        try {
          const existing = await findWishlistItemByProduct(user.id, productId);
          if (existing?.id) {
            setWishlistItemId(existing.id);
            return;
          }
        } catch {
          // Fall back to a visible error below if reconciliation fails.
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={loginHref}
        className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Sign in to save in wishlist"
        title="Sign in to save in wishlist"
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={isLoading}
        className={`inline-flex size-10 items-center justify-center rounded-md border transition disabled:opacity-60 ${
          wishlistItemId
            ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-label={
          isLoading
            ? "Updating wishlist"
            : wishlistItemId
              ? "Remove from wishlist"
              : "Save to wishlist"
        }
        title={wishlistItemId ? "Saved in wishlist" : "Save to wishlist"}
      >
        <HeartIcon filled={Boolean(wishlistItemId)} />
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
