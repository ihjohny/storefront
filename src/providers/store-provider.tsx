"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { features } from "@/lib/config/features";
import { getPublicStores } from "@/lib/api/stores";
import type { Store } from "@/lib/types/store";

const STORAGE_KEY = "bs-selected-store";
const COOKIE_KEY = "bs-selected-store-id";

export type StoreContextType = {
  stores: Store[];
  selectedStore: Store | null;
  previousStoreId: string | null;
  selectStore: (storeId: string) => void;
  clearSelection: () => void;
  isLoading: boolean;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);

function readPersistedStoreId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistStoreId(storeId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (storeId) {
      localStorage.setItem(STORAGE_KEY, storeId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* quota or security restriction */
  }

  try {
    if (storeId) {
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(storeId)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } else {
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    /* cookie write failed */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(features.multiStore);
  const previousStoreIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!features.multiStore) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const publicStores = await getPublicStores();
        if (cancelled) return;

        setStores(publicStores);

        const persisted = readPersistedStoreId();
        const match = publicStores.find((s) => s.id === persisted);
        if (match) {
          setSelectedStoreId(match.id);
          persistStoreId(match.id);
        }
      } catch {
        /* stores load failed — feature degrades gracefully */
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isInitialLoadRef.current = false;
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectStore = useCallback(
    (storeId: string) => {
      const match = stores.find((s) => s.id === storeId);
      if (!match) return;
      previousStoreIdRef.current = selectedStoreId;
      setSelectedStoreId(storeId);
      persistStoreId(storeId);
      router.refresh();
    },
    [stores, selectedStoreId, router],
  );

  const clearSelection = useCallback(() => {
    previousStoreIdRef.current = selectedStoreId;
    setSelectedStoreId(null);
    persistStoreId(null);
    router.refresh();
  }, [selectedStoreId, router]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  );

  const value = useMemo<StoreContextType>(
    () => ({
      stores,
      selectedStore,
      previousStoreId: previousStoreIdRef.current,
      selectStore,
      clearSelection,
      isLoading,
    }),
    [stores, selectedStore, selectStore, clearSelection, isLoading],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
