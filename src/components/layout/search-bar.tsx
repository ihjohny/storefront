"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  locale: string;
  placeholder?: string;
  onSearchComplete?: () => void;
};

export function SearchBar({
  locale,
  placeholder = "Search products",
  onSearchComplete,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      router.push(`/${locale}/products`);
    } else {
      const params = new URLSearchParams({ search: trimmed });
      router.push(`/${locale}/products?${params.toString()}`);
    }

    onSearchComplete?.();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
      />
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
      >
        Search
      </button>
    </form>
  );
}
