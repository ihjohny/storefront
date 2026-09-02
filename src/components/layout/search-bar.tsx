"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  locale: string;
  placeholder?: string;
  onSearchComplete?: () => void;
  focusOnMount?: boolean;
  className?: string;
  showButton?: boolean;
};

export function SearchBar({
  locale,
  placeholder = "Search products...",
  onSearchComplete,
  focusOnMount = false,
  className = "",
  showButton = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!focusOnMount) {
      return;
    }

    inputRef.current?.focus();
  }, [focusOnMount]);

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
    <form onSubmit={onSubmit} className={`relative flex w-full items-center ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M13.5 13.5L17 17M9 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-2xs transition hover:bg-muted/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {showButton ? (
        <button
          type="submit"
          className="ml-2 shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-2xs transition hover:bg-primary/90"
        >
          Search
        </button>
      ) : null}
    </form>
  );
}
