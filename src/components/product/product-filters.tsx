"use client";

import { useState } from "react";
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

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("search", search.trim() || null);
    updateParam("minPrice", minPrice.trim() || null);
    updateParam("maxPrice", maxPrice.trim() || null);
  }

  return (
    <aside className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="space-y-2">
        <label htmlFor="sort" className="text-sm font-medium">
          Sort
        </label>
        <select
          id="sort"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          value={searchParams.get("sort") ?? "-createdAt"}
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
        <div className="space-y-1">
          <label htmlFor="search" className="text-sm font-medium">
            Search
          </label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Apply Filters
        </button>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium">Categories</p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
            onClick={() => updateParam("category", null)}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
              onClick={() => updateParam("category", category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
