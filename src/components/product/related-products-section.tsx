import { features } from "@/lib/config/features";
import { getProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types/product";
import { getSelectedStoreId } from "@/lib/utils/get-store-id";

function firstCategoryId(product: Product): string | undefined {
  const raw = product.categories?.[0];
  if (!raw) return undefined;
  return typeof raw === "string" ? raw : raw.id;
}

function tenantId(product: Product): string | undefined {
  if (!features.multivendor) return undefined;
  const t = product.tenant;
  if (!t || typeof t === "string") return t ?? undefined;
  return t.id;
}

type RelatedProductsSectionProps = {
  locale: string;
  currentProductId: string;
  product: Product;
  title: string;
};

export async function RelatedProductsSection({
  locale,
  currentProductId,
  product,
  title,
}: RelatedProductsSectionProps) {
  const categoryId = firstCategoryId(product);
  if (!categoryId) return null;

  const storeId = await getSelectedStoreId();
  const tenant = tenantId(product);

  let docs: Product[] = [];
  try {
    const res = await getProducts({
      category: categoryId,
      locale,
      limit: 12,
      storeId,
      ...(tenant ? { tenant } : {}),
    });
    docs = res.docs as Product[];
  } catch {
    return null;
  }

  const related = docs.filter((p) => p.id !== currentProductId).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-border pt-10" aria-labelledby="related-products-heading">
      <h2 id="related-products-heading" className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} locale={locale} />
        ))}
      </div>
    </section>
  );
}
