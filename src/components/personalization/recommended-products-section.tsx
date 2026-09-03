import type { Product } from "@/lib/types/product";
import { ProductGrid } from "@/components/product/product-grid";

interface RecommendedProductsSectionProps {
  products: Product[];
  locale: string;
  title?: string;
  subtitle?: string;
  personalized?: boolean;
}

export function RecommendedProductsSection({
  products,
  locale,
  title = "Recommended For You",
  subtitle = "Handpicked based on your preferences and popular selections",
  personalized = false,
}: RecommendedProductsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-6 py-6 border-t border-border">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {personalized ? "Personalized For You" : "Trending & Verified"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ProductGrid
        products={products.slice(0, 4)}
        locale={locale}
        emptyMessage="No recommendations available."
      />
    </section>
  );
}
