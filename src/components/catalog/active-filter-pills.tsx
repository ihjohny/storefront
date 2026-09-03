"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Attribute } from "@/lib/types/attribute";
import type { Category } from "@/lib/types/category";

interface ActiveFilterPillsProps {
  categories?: Category[];
  brands?: Attribute[];
  attributes?: Attribute[];
}

export function ActiveFilterPills({
  categories = [],
  brands = [],
  attributes = [],
}: ActiveFilterPillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brandId = searchParams.get("brand");
  const categoryId = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const featured = searchParams.get("featured") === "1";
  const inStockAtStore = searchParams.get("inStockAtStore");
  const rawAttrs = searchParams.get("attributes");
  const selectedAttrs = rawAttrs ? rawAttrs.split(",").filter(Boolean) : [];

  const activePills: Array<{ label: string; onRemove: () => void }> = [];

  function removeParam(key: string, valueToRemove?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valueToRemove && key === "attributes") {
      const current = selectedAttrs.filter((id) => id !== valueToRemove);
      if (current.length > 0) {
        params.set("attributes", current.join(","));
      } else {
        params.delete("attributes");
      }
    } else {
      params.delete(key);
    }
    params.delete("page");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["brand", "category", "attributes", "minPrice", "maxPrice", "featured", "inStockAtStore"].forEach(
      (k) => params.delete(k)
    );
    params.delete("page");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  if (brandId) {
    const brand = brands.find((b) => b.id === brandId);
    activePills.push({
      label: `Brand: ${brand?.label || "Selected"}`,
      onRemove: () => removeParam("brand"),
    });
  }

  if (categoryId) {
    const cat = categories.find((c) => c.id === categoryId);
    activePills.push({
      label: `Category: ${cat?.name || "Selected"}`,
      onRemove: () => removeParam("category"),
    });
  }

  if (minPrice && maxPrice) {
    activePills.push({
      label: `Price: $${minPrice} - $${maxPrice}`,
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("minPrice");
        params.delete("maxPrice");
        params.delete("page");
        const nextQuery = params.toString();
        router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
      },
    });
  } else if (minPrice) {
    activePills.push({
      label: `Price: > $${minPrice}`,
      onRemove: () => removeParam("minPrice"),
    });
  } else if (maxPrice) {
    activePills.push({
      label: `Price: < $${maxPrice}`,
      onRemove: () => removeParam("maxPrice"),
    });
  }

  if (featured) {
    activePills.push({
      label: "Featured Only",
      onRemove: () => removeParam("featured"),
    });
  }

  if (inStockAtStore === "0") {
    activePills.push({
      label: "All Locations",
      onRemove: () => removeParam("inStockAtStore"),
    });
  }

  selectedAttrs.forEach((attrId) => {
    const attr = attributes.find((a) => a.id === attrId);
    activePills.push({
      label: attr ? attr.label : "Attribute",
      onRemove: () => removeParam("attributes", attrId),
    });
  });

  if (activePills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      <span className="text-xs font-medium text-muted-foreground mr-1">Active filters:</span>
      {activePills.map((pill, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-foreground transition hover:bg-muted"
        >
          <span>{pill.label}</span>
          <button
            type="button"
            onClick={pill.onRemove}
            className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${pill.label}`}
          >
            ✕
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-primary hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
