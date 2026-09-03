"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types/category";
import type { Attribute } from "@/lib/types/attribute";
import { InStockLocationCatalogToggle } from "@/components/product/in-stock-location-catalog-toggle";

export type ProductFiltersProps = {
  categories?: Category[];
  brands?: Attribute[];
  attributes?: Attribute[];
  hideCategoryFilter?: boolean;
  hideBrandFilter?: boolean;
  /** Multi-store + geography + visitor has a bound stock location — shows PLP-only stock filter. */
  inStockLocationToggleEnabled?: boolean;
  inStockLocationLabel?: string;
  inStockLocationHint?: string;
};

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "basePrice", label: "Price: Low to High" },
  { value: "-basePrice", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
] as const;

const panelClass =
  "space-y-4 rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur lg:space-y-5 lg:rounded-xl lg:border lg:border-border lg:bg-card/90 lg:p-5 lg:shadow-sm";

export function ProductFilters({
  categories = [],
  brands = [],
  attributes = [],
  hideCategoryFilter = false,
  hideBrandFilter = false,
  inStockLocationToggleEnabled = false,
  inStockLocationLabel = "",
  inStockLocationHint,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [brandSearch, setBrandSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);

  const selectedCategory = searchParams.get("category");
  const selectedBrand = searchParams.get("brand");
  const selectedAttributes = useMemo(() => {
    const raw = searchParams.get("attributes");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const selectedSort = searchParams.get("sort") ?? "-createdAt";
  const featuredOnly = searchParams.get("featured") === "1";
  const fullCatalogListing = searchParams.get("inStockAtStore") === "0";

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && !hideCategoryFilter) count += 1;
    if (selectedBrand && !hideBrandFilter) count += 1;
    if (selectedAttributes.length > 0) count += selectedAttributes.length;
    if (minPrice.trim()) count += 1;
    if (maxPrice.trim()) count += 1;
    if (featuredOnly) count += 1;
    if (fullCatalogListing) count += 1;
    if (selectedSort !== "-createdAt") count += 1;
    return count;
  }, [
    featuredOnly,
    fullCatalogListing,
    hideBrandFilter,
    hideCategoryFilter,
    maxPrice,
    minPrice,
    selectedAttributes.length,
    selectedBrand,
    selectedCategory,
    selectedSort,
  ]);

  function pushWithUpdates(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function updateParam(key: string, value: string | null) {
    pushWithUpdates({ [key]: value });
  }

  function toggleAttribute(attrId: string) {
    const current = new Set(selectedAttributes);
    if (current.has(attrId)) {
      current.delete(attrId);
    } else {
      current.add(attrId);
    }
    const nextVal = Array.from(current).join(",");
    pushWithUpdates({ attributes: nextVal || null });
  }

  function applyPricePreset(min: number | null, max: number | null) {
    setMinPrice(min !== null ? String(min) : "");
    setMaxPrice(max !== null ? String(max) : "");
    pushWithUpdates({
      minPrice: min !== null ? String(min) : null,
      maxPrice: max !== null ? String(max) : null,
    });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    [
      "category",
      "brand",
      "attributes",
      "minPrice",
      "maxPrice",
      "featured",
      "sort",
      "inStockAtStore",
    ].forEach((key) => {
      params.delete(key);
    });
    params.delete("page");
    setMinPrice("");
    setMaxPrice("");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushWithUpdates({
      minPrice: minPrice.trim() || null,
      maxPrice: maxPrice.trim() || null,
    });
  }

  function toggleFiltersFromFab() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    requestAnimationFrame(() => {
      asideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter(
      (b) => b.label.toLowerCase().includes(q) || b.key.toLowerCase().includes(q)
    );
  }, [brands, brandSearch]);

  const seriesAttributes = useMemo(() => {
    return attributes.filter((a) => a.type === "series");
  }, [attributes]);

  const showMobilePanel = isOpen;
  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs transition focus:outline-none focus:ring-2 focus:ring-ring/60";

  return (
    <aside
      ref={asideRef}
      className={
        showMobilePanel
          ? panelClass
          : "h-0 overflow-visible border-0 p-0 lg:h-auto lg:space-y-5 lg:rounded-xl lg:border lg:border-border lg:bg-card/90 lg:p-5 lg:shadow-sm lg:backdrop-blur"
      }
    >
      <div className={`${showMobilePanel ? "flex" : "hidden"} items-center justify-between lg:flex`}>
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background shadow-xs">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M3 5h14M6 10h8M8 15h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-sm font-semibold tracking-tight text-foreground">Filters</p>
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground hover:underline"
          >
            Reset All
          </button>
        ) : null}
      </div>

      <div className={showMobilePanel ? "space-y-5 lg:space-y-5" : "hidden lg:block lg:space-y-5"}>
        {/* Sort Selector */}
        <div className="space-y-1.5">
          <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sort By
          </label>
          <select
            id="sort"
            className={inputClass}
            value={selectedSort}
            onChange={(event) => updateParam("sort", event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brands Filter */}
        {!hideBrandFilter && brands.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Brands
              </p>
              {selectedBrand ? (
                <button
                  type="button"
                  onClick={() => updateParam("brand", null)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {brands.length > 6 ? (
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            ) : null}
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {filteredBrands.map((brand) => {
                const isChecked = selectedBrand === brand.id;
                return (
                  <label
                    key={brand.id}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition hover:bg-muted ${
                      isChecked ? "bg-primary/10 font-medium text-foreground" : "text-foreground/90"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => updateParam("brand", isChecked ? null : brand.id)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <span>{brand.label}</span>
                    </span>
                    {brand.featured ? (
                      <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        Popular
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Price Filter */}
        <div className="space-y-2.5 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Range
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => applyPricePreset(null, 50)}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Under $50
            </button>
            <button
              type="button"
              onClick={() => applyPricePreset(50, 150)}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              $50 - $150
            </button>
            <button
              type="button"
              onClick={() => applyPricePreset(150, null)}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              $150+
            </button>
          </div>
          <form className="space-y-2.5" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="minPrice" className="text-xs text-muted-foreground">
                  Min
                </label>
                <input
                  id="minPrice"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                  Max
                </label>
                <input
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  inputMode="decimal"
                  placeholder="1000"
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90"
            >
              Apply Price
            </button>
          </form>
        </div>

        {/* Product Series / Attributes Filter */}
        {seriesAttributes.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product Series
            </p>
            <div className="space-y-1">
              {seriesAttributes.map((attr) => {
                const isChecked = selectedAttributes.includes(attr.id);
                return (
                  <label
                    key={attr.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition hover:bg-muted ${
                      isChecked ? "bg-primary/10 font-medium text-foreground" : "text-foreground/90"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAttribute(attr.id)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <span>{attr.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Categories Filter */}
        {!hideCategoryFilter && categories.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
              <button
                type="button"
                className={`rounded-md px-2.5 py-1.5 text-left text-sm transition hover:bg-muted ${
                  !selectedCategory
                    ? "bg-primary/15 font-medium text-foreground ring-1 ring-inset ring-border"
                    : "text-foreground/90"
                }`}
                onClick={() => updateParam("category", null)}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`rounded-md px-2.5 py-1.5 text-left text-sm transition hover:bg-muted ${
                    selectedCategory === category.id
                      ? "bg-primary/15 font-medium text-foreground ring-1 ring-inset ring-border"
                      : "text-foreground/90"
                  }`}
                  onClick={() => updateParam("category", category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Toggles */}
        <div className="space-y-2 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/90">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => updateParam("featured", event.target.checked ? "1" : null)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <span>Featured products only</span>
          </label>
          <InStockLocationCatalogToggle
            enabled={inStockLocationToggleEnabled}
            label={inStockLocationLabel}
            hint={inStockLocationHint}
          />
        </div>
      </div>

      {showScrollTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-16 right-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-lg backdrop-blur lg:hidden"
          aria-label="Scroll to top"
          title="Top"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M10 15V5M10 5 6.5 8.5M10 5l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      <button
        type="button"
        onClick={toggleFiltersFromFab}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg lg:hidden"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M3 5h14M6 10h8M8 15h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {isOpen ? "Close" : `Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
      </button>
    </aside>
  );
}
