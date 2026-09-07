import Link from "next/link";
import type { Product, ClassParameter } from "@/lib/types/product";
import { getProductBrand, getProductSeries, getProductAttributes } from "@/lib/utils/product-attributes";

function getLocalizedText(
  value: string | Record<string, string> | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[locale] || value.en || Object.values(value)[0] || fallback;
  }
  return String(value);
}

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
          {brand.name || brand.label}
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
    } else if (attr.type === "specification") {
      specs.push({ label: "Specification", value: attr.label });
    } else if (attr.type === "feature") {
      specs.push({ label: "Feature", value: attr.label });
    } else if (attr.type === "connectivity") {
      specs.push({ label: "Connectivity", value: attr.label });
    } else if (attr.type === "compatibility") {
      specs.push({ label: "Compatibility", value: attr.label });
    } else if (attr.type === "certification") {
      specs.push({ label: "Certification", value: attr.label });
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

  // Add class-inherited dynamic specifications
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    const classParamsMap = new Map<string, ClassParameter>();
    if (
      product.productClass &&
      typeof product.productClass === "object" &&
      Array.isArray(product.productClass.parameters)
    ) {
      for (const param of product.productClass.parameters) {
        if (param?.key) {
          classParamsMap.set(param.key, param);
        }
      }
    }

    product.specifications.forEach((spec) => {
      if (!spec || spec.value === null || spec.value === undefined || spec.value === "") return;

      const param = classParamsMap.get(spec.key);
      const label =
        spec.label ||
        (param?.label ? getLocalizedText(param.label, locale) : "") ||
        spec.key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const rawVal = Array.isArray(spec.value)
        ? (spec.value as string[]).join(", ")
        : String(spec.value).trim();
      let displayVal = rawVal;

      if (param?.options && param.options.length > 0) {
        const directMatch = param.options.find(
          (opt) => opt.value.toLowerCase() === rawVal.toLowerCase(),
        );
        if (directMatch) {
          displayVal = getLocalizedText(directMatch.label, locale, rawVal);
        } else if (rawVal.includes(",")) {
          const parts = rawVal.split(",").map((p) => p.trim());
          const matchedParts = parts.map((part) => {
            const found = param.options?.find(
              (opt) => opt.value.toLowerCase() === part.toLowerCase(),
            );
            return found ? getLocalizedText(found.label, locale, part) : part;
          });
          displayVal = matchedParts.join(", ");
        }
      } else if (rawVal.toLowerCase() === "true") {
        displayVal = "Yes";
      } else if (rawVal.toLowerCase() === "false") {
        displayVal = "No";
      } else {
        const unit = spec.unit || param?.unit;
        if (unit && !rawVal.toLowerCase().endsWith(unit.toLowerCase())) {
          displayVal = `${rawVal} ${unit}`;
        }
      }

      specs.push({
        label,
        value: displayVal,
      });
    });
  }

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
            More from {brand.name || brand.label} →
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
