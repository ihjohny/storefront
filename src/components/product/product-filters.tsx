"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types/category";

type ProductFiltersProps = {
  categories: Category[];
};

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "basePrice", label: "Price: Low to High" },
  { value: "-basePrice", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
] as const;

const panelClass =
  "space-y-4 rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur lg:space-y-4 lg:rounded-xl lg:border lg:border-border lg:bg-card/90 lg:p-4 lg:shadow-sm";

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const selectedCategory = searchParams.get("category");
  const selectedSort = searchParams.get("sort") ?? "-createdAt";
  const featuredOnly = searchParams.get("featured") === "1";

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
    if (selectedCategory) count += 1;
    if (minPrice.trim()) count += 1;
    if (maxPrice.trim()) count += 1;
    if (featuredOnly) count += 1;
    if (selectedSort !== "-createdAt") count += 1;
    return count;
  }, [featuredOnly, maxPrice, minPrice, selectedCategory, selectedSort]);

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

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    ["category", "minPrice", "maxPrice", "featured", "sort"].forEach((key) => {
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

  const showMobilePanel = isOpen;

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/60";

  return (
    <aside
      ref={asideRef}
      className={
        showMobilePanel
          ? panelClass
          : "h-0 overflow-visible border-0 p-0 lg:h-auto lg:space-y-4 lg:rounded-xl lg:border lg:border-border lg:bg-card/90 lg:p-4 lg:shadow-sm lg:backdrop-blur"
      }
    >
      <div className={`${showMobilePanel ? "flex" : "hidden"} items-center lg:flex`}>
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M3 5h14M6 10h8M8 15h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-sm font-semibold">Filters</p>
          {activeFilterCount ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
      </div>

      <div className={showMobilePanel ? "space-y-4 lg:space-y-4" : "hidden lg:block lg:space-y-4"}>
        <div className="space-y-2">
          <label htmlFor="sort" className="text-sm font-medium">
            Sort
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

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="minPrice" className="text-sm font-medium">
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
              <label htmlFor="maxPrice" className="text-sm font-medium">
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => updateParam("featured", event.target.checked ? "1" : null)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            Featured only
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition hover:bg-muted"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-sm font-medium">Categories</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={`rounded-md px-2 py-1 text-left text-sm transition hover:bg-muted ${
                !selectedCategory
                  ? "bg-primary/15 font-medium text-foreground ring-1 ring-inset ring-border"
                  : "text-foreground"
              }`}
              onClick={() => updateParam("category", null)}
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`rounded-md px-2 py-1 text-left text-sm transition hover:bg-muted ${
                  selectedCategory === category.id
                    ? "bg-primary/15 font-medium text-foreground ring-1 ring-inset ring-border"
                    : "text-foreground"
                }`}
                onClick={() => updateParam("category", category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
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
        {isOpen ? "Close" : "Filters"}
      </button>
    </aside>
  );
}
