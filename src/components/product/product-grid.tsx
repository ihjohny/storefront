import type { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/product-card";

type ProductGridProps = {
  products: Product[];
  locale: string;
  emptyMessage?: string;
  /** Stock-location-filtered listing + env flag — forwards badge label to cards. */
  availabilityBadgeLabel?: string | null;
};

export function ProductGrid({
  products,
  locale,
  emptyMessage = "No products found for your current filters.",
  availabilityBadgeLabel = null,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          availabilityBadgeLabel={availabilityBadgeLabel}
        />
      ))}
    </div>
  );
}
