"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MAX_PRODUCT_COMPARE_ITEMS,
  PRODUCT_COMPARE_STORAGE_KEY,
} from "@/lib/product-compare/constants";
import {
  type CompareLineItem,
  compareLineKey,
  normalizeCompareLines,
  serializeCompareItemsQuery,
} from "@/lib/product-compare/compare-line-items";

export type { CompareLineItem };

export type ProductCompareContextValue = {
  entries: CompareLineItem[];
  hydrated: boolean;
  toggleEntry: (productId: string, variantId?: string | null) => void;
  removeEntry: (productId: string, variantId?: string | null) => void;
  clearAll: () => void;
  replaceEntries: (next: CompareLineItem[]) => void;
  hasEntry: (productId: string, variantId?: string | null) => boolean;
  isFull: boolean;
};

const ProductCompareContext = createContext<ProductCompareContextValue | null>(null);

function coerceVariantId(raw: string | null | undefined): string | null {
  if (raw == null) {
    return null;
  }
  const t = String(raw).trim();
  return t === "" ? null : t;
}

function readStoredEntries(): CompareLineItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(PRODUCT_COMPARE_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    /** Legacy: JSON array of product id strings */
    if (typeof parsed[0] === "string") {
      return normalizeCompareLines(
        (parsed as string[]).map((productId) => ({
          productId: String(productId).trim(),
          variantId: null,
        })),
      );
    }
    if (parsed[0] && typeof parsed[0] === "object" && parsed[0] !== null && "productId" in parsed[0]) {
      return normalizeCompareLines(
        (parsed as Array<{ productId?: unknown; variantId?: unknown }>).map((row) => ({
          productId: String(row.productId ?? "").trim(),
          variantId: coerceVariantId(row.variantId as string | null | undefined),
        })),
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function ProductCompareProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CompareLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(readStoredEntries());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CompareLineItem[]) => {
    try {
      localStorage.setItem(PRODUCT_COMPARE_STORAGE_KEY, JSON.stringify(normalizeCompareLines(next)));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const replaceEntries = useCallback(
    (next: CompareLineItem[]) => {
      const normalized = normalizeCompareLines(next);
      setEntries((prev) => {
        if (serializeCompareItemsQuery(prev) === serializeCompareItemsQuery(normalized)) {
          return prev;
        }
        persist(normalized);
        return normalized;
      });
    },
    [persist],
  );

  const toggleEntry = useCallback(
    (productId: string, variantId?: string | null) => {
      const pid = productId.trim();
      if (!pid) {
        return;
      }
      const line: CompareLineItem = { productId: pid, variantId: coerceVariantId(variantId) };
      const key = compareLineKey(line);
      setEntries((prev) => {
        const exists = prev.some((e) => compareLineKey(e) === key);
        let next: CompareLineItem[];
        if (exists) {
          next = prev.filter((e) => compareLineKey(e) !== key);
        } else if (prev.length >= MAX_PRODUCT_COMPARE_ITEMS) {
          next = prev;
        } else {
          next = [...prev, line];
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeEntry = useCallback(
    (productId: string, variantId?: string | null) => {
      const line: CompareLineItem = {
        productId: productId.trim(),
        variantId: coerceVariantId(variantId),
      };
      const key = compareLineKey(line);
      setEntries((prev) => {
        const next = prev.filter((e) => compareLineKey(e) !== key);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    setEntries([]);
    persist([]);
  }, [persist]);

  const value = useMemo<ProductCompareContextValue>(
    () => ({
      entries,
      hydrated,
      toggleEntry,
      removeEntry,
      clearAll,
      replaceEntries,
      hasEntry: (productId: string, variantId?: string | null) => {
        const line: CompareLineItem = {
          productId: productId.trim(),
          variantId: coerceVariantId(variantId),
        };
        const key = compareLineKey(line);
        return entries.some((e) => compareLineKey(e) === key);
      },
      isFull: entries.length >= MAX_PRODUCT_COMPARE_ITEMS,
    }),
    [clearAll, entries, hydrated, removeEntry, replaceEntries, toggleEntry],
  );

  return (
    <ProductCompareContext.Provider value={value}>{children}</ProductCompareContext.Provider>
  );
}

export function useProductCompare(): ProductCompareContextValue {
  const ctx = useContext(ProductCompareContext);
  if (!ctx) {
    throw new Error("useProductCompare must be used within ProductCompareProvider");
  }
  return ctx;
}

export function useProductCompareOptional(): ProductCompareContextValue | null {
  return useContext(ProductCompareContext);
}
