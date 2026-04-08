type RatingStarsProps = {
  rating: number;
  max?: number;
  sizeClassName?: string;
};

export function RatingStars({
  rating,
  max = 5,
  sizeClassName = "h-4 w-4",
}: RatingStarsProps) {
  const normalized = Math.max(0, Math.min(max, rating));
  const full = Math.floor(normalized);
  const hasHalf = normalized - full >= 0.5;

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${normalized} out of ${max}`}>
      {Array.from({ length: max }).map((_, index) => {
        const isFull = index < full;
        const isHalf = !isFull && hasHalf && index === full;
        return (
          <span
            key={`star-${index}`}
            className={`${sizeClassName} inline-flex items-center justify-center ${
              isFull || isHalf
                ? "text-amber-500 dark:text-amber-400"
                : "text-slate-300 dark:text-slate-700"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
