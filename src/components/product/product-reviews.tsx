"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { features } from "@/lib/config/features";
import { createProductReview, getProductReviews, type ProductReview } from "@/lib/api/reviews";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatDate } from "@/lib/utils/format-date";
import { RatingStars } from "@/components/shared/rating-stars";

type ProductReviewsProps = {
  productId: string;
  locale: string;
};

function getReviewerName(author: ProductReview["author"]): string {
  if (typeof author === "object") {
    const name = author.displayName?.trim();
    if (name) return name;
    if (author.email) return author.email.split("@")[0] ?? "Customer";
  }
  return "Customer";
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase() || "?";
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!features.reviews) return;
    void getProductReviews(productId, 1).then((res) => setReviews(res.docs));
  }, [productId]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  if (!features.reviews) {
    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createProductReview({ product: productId, rating, title, body });
      const next = await getProductReviews(productId, 1);
      setReviews(next.docs);
      setTitle("");
      setBody("");
      setRating(5);
    } catch {
      setError("Unable to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Customer reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See what shoppers say about this product.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {reviews.length > 0 ? average.toFixed(1) : "—"}
          </span>
          <div className="flex flex-col gap-0.5">
            <RatingStars rating={average} sizeClassName="h-5 w-5" />
            <span className="text-xs text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const name = getReviewerName(review.author);
            const initials = getInitials(name);
            return (
              <li
                key={review.id}
                className="rounded-xl border border-border bg-background/80 p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                    aria-hidden
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{name}</span>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={review.createdAt}
                      >
                        {formatDate(review.createdAt, locale)}
                      </time>
                    </div>
                    <RatingStars rating={review.rating} sizeClassName="h-4 w-4" />
                    {review.title ? (
                      <p className="font-medium text-foreground">{review.title}</p>
                    ) : null}
                    <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isAuthenticated ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-foreground">Write a review</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Rate the product and tell others what you think.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground" id="review-rating-label">
              Overall rating
            </span>
            <div
              className="flex flex-wrap gap-1"
              role="group"
              aria-labelledby="review-rating-label"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
                    rating === value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground ring-1 ring-border hover:bg-muted"
                  }`}
                  aria-pressed={rating === value}
                >
                  {value}★
                </button>
              ))}
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Review title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Summarize your experience"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Your review</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What did you like or dislike? How was the quality?"
              rows={4}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href={`/${locale}/auth/login`} className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      )}
    </section>
  );
}
