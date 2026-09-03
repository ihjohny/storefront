import Link from "next/link";
import type { Product } from "@/lib/types/product";
import { getProductBrand, getProductSeries, getProductAttributes } from "@/lib/utils/product-attributes";

interface ProductSpecificationsProps {
  product: Product;
  locale: string;
}

export function ProductSpecifications({ product, locale }: ProductSpecificationsProps) {
  const brand = getProductBrand(product);
  const series = getProductSeries(product);
  const allAttrs = getProductAttributes(product);

  const specs: Array<{ label: string; value: React.ReactNode }> = [];

  if (brand) {
    specs.push({
      label: "Brand",
      value: (
        <Link
          href={`/${locale}/brands/${brand.slug}`}
          className="font-medium text-primary hover:underline"
        >
          {brand.label}
        </Link>
      ),
    });
  }

  if (series) {
    specs.push({
      label: "Series / Collection",
      value: series.label,
    });
  }

  // Add all other attributes and dynamic properties
  allAttrs.forEach((attr) => {
    if (attr.type === "material") {
      specs.push({ label: "Material", value: attr.label });
    } else if (attr.type === "manufacturer") {
      specs.push({ label: "Manufacturer", value: attr.label });
    }

    if (attr.properties && Array.isArray(attr.properties)) {
      attr.properties.forEach((prop) => {
        const formattedKey = prop.propertyKey
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        specs.push({
          label: formattedKey,
          value: prop.propertyValue,
        });
      });
    }
  });

  if (product.sku) {
    specs.push({ label: "Model / SKU", value: product.sku });
  }

  if (specs.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Product Specifications & Details
        </h2>
        {brand ? (
          <Link
            href={`/${locale}/brands/${brand.slug}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            More from {brand.label} →
          </Link>
        ) : null}
      </div>

      <div className="mt-4 divide-y divide-border">
        {specs.map((spec, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 py-3 text-sm sm:grid-cols-3 sm:gap-4"
          >
            <dt className="font-medium text-muted-foreground">{spec.label}</dt>
            <dd className="text-foreground sm:col-span-2">{spec.value}</dd>
          </div>
        ))}
      </div>
    </section>
  );
}
