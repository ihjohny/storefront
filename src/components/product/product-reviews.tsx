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
    <section className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="flex items-center gap-2">
          <RatingStars rating={average} />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {average.toFixed(1)} ({reviews.length})
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-1 flex items-center justify-between gap-2">
              <RatingStars rating={review.rating} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(review.createdAt, locale)}
              </span>
            </div>
            <p className="text-sm font-medium">{review.title || "Review"}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{review.body}</p>
          </article>
        ))}
      </div>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Rating</span>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={`rating-${value}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Review title"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write your review"
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {isSubmitting ? "Submitting..." : "Write a Review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <Link href={`/${locale}/auth/login`} className="underline">
            Login
          </Link>{" "}
          to review this product.
        </p>
      )}
    </section>
  );
}
