type LoadingSkeletonProps = {
  className?: string;
  lines?: number;
};

export function LoadingSkeleton({
  className = "h-4 w-full",
  lines = 1,
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`skeleton-line-${index}`}
          className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
        />
      ))}
    </div>
  );
}
