import { features } from "@/lib/config/features";
import type { ProductCompareLabels } from "@/lib/i18n/compare-labels";
import { MAX_PRODUCT_COMPARE_ITEMS } from "@/lib/product-compare/constants";

export const COMPARE_LABEL_COLUMN_CLASS =
  "sticky left-0 z-[2] w-[7.5rem] shrink-0 bg-muted/90 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm sm:w-36 sm:text-sm sm:normal-case sm:tracking-normal";

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-muted-foreground/20 motion-safe:animate-pulse ${className ?? ""}`}
      aria-hidden
    />
  );
}

type CompareLoadingSkeletonProps = {
  columnCount: number;
  labels?: Pick<ProductCompareLabels, "pageTitle">;
};

export function CompareLoadingSkeleton({
  columnCount,
  labels,
}: CompareLoadingSkeletonProps) {
  const cols = Math.min(Math.max(columnCount, 1), MAX_PRODUCT_COMPARE_ITEMS);
  const specRows = features.multivendor ? 6 : 5;

  const body = (
    <>
      <div className="space-y-4 md:hidden">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <div
            key={`m-${colIdx}`}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex gap-3 border-b border-border p-4">
              <ShimmerBar className="size-20 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <ShimmerBar className="h-5 max-w-[14rem]" />
                <ShimmerBar className="h-8 w-20" />
              </div>
            </div>
            <div className="divide-y divide-border bg-muted/20">
              {Array.from({ length: specRows }).map((__, rowIdx) => (
                <div key={rowIdx} className="flex gap-3 px-4 py-2.5">
                  <ShimmerBar className="h-4 w-[38%] max-w-[11rem] shrink-0 sm:w-[32%]" />
                  <ShimmerBar className="h-4 min-w-0 flex-1 max-w-xs" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="min-w-[520px] overflow-x-auto overscroll-x-contain">
            <div className="flex border-b border-border bg-muted/50">
              <div
                className={`${COMPARE_LABEL_COLUMN_CLASS} align-bottom pb-3 pt-3`}
                aria-hidden
              />
              {Array.from({ length: cols }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="flex min-w-0 flex-1 flex-col items-center gap-3 border-l border-border px-3 py-4"
                >
                  <ShimmerBar className="h-8 w-14" />
                  <ShimmerBar className="aspect-square w-full max-w-[9rem] rounded-lg" />
                  <ShimmerBar className="h-4 w-full max-w-[10rem]" />
                  <ShimmerBar className="h-3 w-full max-w-[8rem]" />
                </div>
              ))}
            </div>
            {Array.from({ length: specRows }).map((_, ri) => (
              <div key={`r-${ri}`} className="flex border-t border-border">
                <div
                  className={`${COMPARE_LABEL_COLUMN_CLASS} flex items-center py-3`}
                  aria-hidden
                >
                  <ShimmerBar className="h-3 w-14 sm:h-4 sm:w-[4.5rem]" />
                </div>
                {Array.from({ length: cols }).map((__, ci) => (
                  <div
                    key={`c-${ci}`}
                    className="flex min-w-0 flex-1 items-center justify-center border-l border-border px-3 py-3 sm:justify-start"
                  >
                    <ShimmerBar className="h-4 w-full max-w-[6.5rem]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (labels?.pageTitle) {
    return (
      <section aria-busy="true" aria-label={labels.pageTitle} className="space-y-4">
        {body}
      </section>
    );
  }

  return <div className="space-y-4">{body}</div>;
}
