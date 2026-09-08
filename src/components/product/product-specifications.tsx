import Link from "next/link";
import type { Product, ProductSpecificationItem } from "@/lib/types/product";
import type { Attribute } from "@/lib/types/attribute";
import { getProductBrand } from "@/lib/utils/product-attributes";

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

interface DisplaySpecItem {
  key: string;
  label: string;
  value: React.ReactNode;
  group: string;
  isCustom?: boolean;
  isAdHoc?: boolean;
}

export function ProductSpecifications({ product, locale }: ProductSpecificationsProps) {
  const brand = getProductBrand(product);

  const groupOrder = [
    "General",
    "Display",
    "Performance",
    "Storage & Memory",
    "Battery & Power",
    "Connectivity & Ports",
    "Audio & Multimedia",
    "Durability & Build",
    "Additional Specifications",
  ];

  const groupedSpecs: Record<string, DisplaySpecItem[]> = {};

  function addSpec(groupName: string, item: DisplaySpecItem) {
    const grp = groupName || "General";
    if (!groupedSpecs[grp]) {
      groupedSpecs[grp] = [];
    }
    groupedSpecs[grp].push(item);
  }

  // Brand in General group
  if (brand) {
    addSpec("General", {
      key: "brand",
      label: "Brand",
      group: "General",
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

  // Model / SKU in General group
  if (product.sku) {
    addSpec("General", {
      key: "sku",
      label: "Model / SKU",
      group: "General",
      value: <span className="font-mono text-sm">{product.sku}</span>,
    });
  }

  // Process unified specifications array
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    product.specifications.forEach((spec: ProductSpecificationItem) => {
      if (!spec) return;

      const hasSingleVal =
        spec.value !== null &&
        spec.value !== undefined &&
        spec.value !== "";
      const hasMultiVal = Array.isArray(spec.values) && spec.values.length > 0;

      if (!hasSingleVal && !hasMultiVal) return;

      // Resolve attribute relation if populated
      const attrDoc =
        typeof spec.attribute === "object" && spec.attribute !== null
          ? (spec.attribute as Attribute)
          : null;

      const label =
        spec.label ||
        (attrDoc ? getLocalizedText(attrDoc.label, locale) : "") ||
        spec.key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const group =
        spec.group ||
        attrDoc?.defaultGroup ||
        "Additional Specifications";

      const unit = spec.unit || attrDoc?.unit || "";

      // Format multi-select values as badges
      if (hasMultiVal && Array.isArray(spec.values)) {
        const renderedValues = (
          <div className="flex flex-wrap gap-1.5">
            {spec.values.map((v, i) => {
              const opt = attrDoc?.options?.find((o) => o.value.toLowerCase() === v.toLowerCase());
              const text = opt ? getLocalizedText(opt.label, locale, v) : v;
              return (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {text}
                </span>
              );
            })}
          </div>
        );

        addSpec(group, {
          key: spec.key,
          label,
          group,
          value: renderedValues,
          isCustom: spec.isCustom,
          isAdHoc: spec.isAdHoc,
        });
        return;
      }

      // Single value
      const rawVal = String(spec.value).trim();
      let displayNode: React.ReactNode = rawVal;

      // Option label lookup
      if (attrDoc?.options && attrDoc.options.length > 0) {
        const directMatch = attrDoc.options.find(
          (opt) => opt.value.toLowerCase() === rawVal.toLowerCase(),
        );
        if (directMatch) {
          const optText = getLocalizedText(directMatch.label, locale, rawVal);
          displayNode = directMatch.hexColor ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="size-3.5 rounded-full border border-border shrink-0"
                style={{ backgroundColor: directMatch.hexColor }}
              />
              <span>{optText}</span>
            </span>
          ) : (
            optText
          );
        } else if (rawVal.includes(",")) {
          const parts = rawVal.split(",").map((p) => p.trim());
          const matchedParts = parts.map((p) => {
            const found = attrDoc.options?.find((o) => o.value.toLowerCase() === p.toLowerCase());
            return found ? getLocalizedText(found.label, locale, p) : p;
          });
          displayNode = matchedParts.join(", ");
        }
      } else if (rawVal.toLowerCase() === "true") {
        displayNode = (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Yes
          </span>
        );
      } else if (rawVal.toLowerCase() === "false") {
        displayNode = (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            No
          </span>
        );
      } else {
        if (unit && !rawVal.toLowerCase().endsWith(unit.toLowerCase())) {
          displayNode = `${rawVal} ${unit}`;
        }
      }

      addSpec(group, {
        key: spec.key,
        label,
        group,
        value: displayNode,
        isCustom: spec.isCustom,
        isAdHoc: spec.isAdHoc,
      });
    });
  }

  const availableGroups = Object.keys(groupedSpecs).sort((a, b) => {
    const idxA = groupOrder.indexOf(a);
    const idxB = groupOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  if (availableGroups.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Technical Specifications
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comprehensive hardware, software, and physical attributes.
          </p>
        </div>
        {brand ? (
          <Link
            href={`/${locale}/brands/${brand.slug}`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            More from {brand.name || brand.label} →
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {availableGroups.map((groupName) => {
          const items = groupedSpecs[groupName];
          if (!items || items.length === 0) return null;

          return (
            <div
              key={groupName}
              className="rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-border/80"
            >
              <h3 className="border-b border-border/80 pb-2.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {groupName}
              </h3>
              <dl className="mt-3 divide-y divide-border/60">
                {items.map((item, idx) => (
                  <div
                    key={`${item.key}-${idx}`}
                    className="grid grid-cols-1 py-2.5 text-sm sm:grid-cols-3 sm:gap-3 items-baseline"
                  >
                    <dt className="font-medium text-muted-foreground flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.isCustom ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground" title="Custom specification">
                          Custom
                        </span>
                      ) : null}
                    </dt>
                    <dd className="text-foreground sm:col-span-2 font-normal">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

