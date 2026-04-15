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
import {
  fetchDeliveryContext,
  fetchGeoCountries,
  fetchGeoLocalities,
  fetchGeoSubdivisions,
} from "@/lib/api/geography";
import { getPublicStores } from "@/lib/api/stores";
import { isTierSelectable } from "@/lib/config/geo-tier-filter";
import type {
  DeliveryPolicy,
  GeoLocalityListItem,
  GeoSubdivisionListItem,
  PersistedServiceArea,
} from "@/lib/types/geography";
import type { Store } from "@/lib/types/store";

const STORAGE_KEY = "bs-selected-store";
const COOKIE_KEY = "bs-selected-store-id";
const SERVICE_AREA_KEY = "bs-service-area-v1";

export type DeliveryContextEmptyReason =
  | "none"
  | "no_public_stores_for_area"
  | "unserved_area";

export type ServiceAreaSlice = {
  countries: { id: string; name: string; isoCode: string }[];
  subdivisions: { id: string; name: string; code: string | null }[];
  localities: { id: string; name: string }[];
  selectedCountryId: string | null;
  selectedSubdivisionId: string | null;
  selectedLocalityId: string | null;
  deliveryPolicy: DeliveryPolicy | null;
  emptyReason: DeliveryContextEmptyReason | null;
  setCountry: (id: string) => void;
  setSubdivision: (id: string) => void;
  setLocality: (id: string | null) => void;
};

export type StoreContextType = {
  stores: Store[];
  selectedStore: Store | null;
  /**
   * Store for cart, checkout, and catalog when the selected service area is shoppable.
   * Null when the area is unserved or has no outlets — carts must not use a remembered store id.
   */
  commerceStore: Store | null;
  /** False when multi-store geography is on and the current area cannot be shopped. */
  canShopCurrentArea: boolean;
  previousStoreId: string | null;
  selectStore: (storeId: string) => void;
  clearSelection: () => void;
  isLoading: boolean;
  /** Set when NEXT_PUBLIC_GEOGRAPHY_ENABLED and multi-store */
  serviceArea?: ServiceAreaSlice;
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

function readPersistedServiceArea(): PersistedServiceArea | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SERVICE_AREA_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedServiceArea;
    if (!p?.countryId || !p?.subdivisionId) return null;
    return {
      countryId: p.countryId,
      subdivisionId: p.subdivisionId,
      localityId: p.localityId ?? null,
    };
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
    /* quota */
  }

  try {
    if (storeId) {
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(storeId)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } else {
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    /* cookie */
  }
}

function persistServiceArea(area: PersistedServiceArea | null): void {
  if (typeof window === "undefined") return;
  try {
    if (area) {
      localStorage.setItem(SERVICE_AREA_KEY, JSON.stringify(area));
    } else {
      localStorage.removeItem(SERVICE_AREA_KEY);
    }
  } catch {
    /* quota */
  }
}

function mapContextToStores(
  rows: Awaited<ReturnType<typeof fetchDeliveryContext>>["stores"],
): Store[] {
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    code: s.code,
    isActive: true,
    isPublicStore: true,
    sortPriority: s.sortPriority ?? 0,
    address: s.address as Store["address"],
  }));
}

/**
 * Subdivisions are sorted by name from the API, so e.g. "Barishal" sorts before "Dhaka".
 * Seeded demo stores only have stock-location service areas under Dhaka and Chattogram codes.
 * Prefer those so the default area resolves to public stores without extra UI steps.
 */
function pickDefaultSubdivisionId(
  subs: { id: string; code?: string | null }[],
): string | null {
  if (!subs.length) return null;
  const byCode = (code: string) =>
    subs.find((s) => s.code === code)?.id ?? null;
  return byCode("BD-DHK") ?? byCode("BD-CTG") ?? subs[0].id;
}

function filterSubdivisionsForUi(
  subs: GeoSubdivisionListItem[],
): GeoSubdivisionListItem[] {
  return subs.filter((s) =>
    isTierSelectable(s.defaultServiceTier, features.geoLocationTierFilter),
  );
}

function filterLocalitiesForUi(locs: GeoLocalityListItem[]): GeoLocalityListItem[] {
  return locs.filter((l) =>
    isTierSelectable(l.serviceTier, features.geoLocationTierFilter),
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const useGeo =
    features.serviceAreaStoreSelection && features.geography;

  const geoFetchOpts = useMemo(
    () =>
      features.geoListOnlyServedAreas
        ? ({ onlyWithPublicStoreCoverage: true } as const)
        : undefined,
    [],
  );

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(features.multiStore);
  const previousStoreIdRef = useRef<string | null>(null);
  /** Keeps last-known {@link Store} per id when the current area returns no outlets, so the gate does not reopen. */
  const storeCatalogRef = useRef<Map<string, Store>>(new Map());

  const [countries, setCountries] = useState<
    { id: string; name: string; isoCode: string }[]
  >([]);
  const [subdivisions, setSubdivisions] = useState<
    { id: string; name: string; code: string | null }[]
  >([]);
  const [localities, setLocalities] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<
    string | null
  >(null);
  const [selectedLocalityId, setSelectedLocalityId] = useState<string | null>(
    null,
  );
  const [deliveryPolicy, setDeliveryPolicy] = useState<DeliveryPolicy | null>(
    null,
  );
  const [emptyReason, setEmptyReason] =
    useState<DeliveryContextEmptyReason | null>(null);
  const [geoFailed, setGeoFailed] = useState(false);

  useEffect(() => {
    for (const s of stores) {
      storeCatalogRef.current.set(s.id, s);
    }
  }, [stores]);

  useEffect(() => {
    if (!features.multiStore) return;

    let cancelled = false;

    async function loadLegacyList() {
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
        /* ignore */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (!useGeo || geoFailed) {
      void loadLegacyList();
      return () => {
        cancelled = true;
      };
    }

    async function loadGeo() {
      setIsLoading(true);
      try {
        const list = await fetchGeoCountries();
        if (cancelled) return;
        if (list.length === 0) {
          setGeoFailed(true);
          return;
        }
        setCountries(list);

        const persistedArea = readPersistedServiceArea();
        const countryId =
          persistedArea?.countryId &&
          list.some((c) => c.id === persistedArea.countryId)
            ? persistedArea.countryId
            : list[0].id;
        setSelectedCountryId(countryId);

        const subsRaw = await fetchGeoSubdivisions(countryId, geoFetchOpts);
        if (cancelled) return;
        const subs = filterSubdivisionsForUi(subsRaw);
        setSubdivisions(subs);

        const preferredSubId = pickDefaultSubdivisionId(subs);

        let subId: string | null =
          persistedArea?.subdivisionId &&
          subs.some((s) => s.id === persistedArea.subdivisionId)
            ? persistedArea.subdivisionId
            : preferredSubId;
        if (!subId && subs.length) subId = subs[0].id;
        setSelectedSubdivisionId(subId);

        if (!subId) {
          setStores([]);
          setDeliveryPolicy(null);
          setEmptyReason("no_public_stores_for_area");
          return;
        }

        const locsRawFirst = await fetchGeoLocalities(subId, geoFetchOpts);
        if (cancelled) return;
        const locs = filterLocalitiesForUi(locsRawFirst);
        setLocalities(locs);

        let locId: string | null =
          persistedArea?.localityId &&
          locs.some((l) => l.id === persistedArea.localityId)
            ? persistedArea.localityId
            : null;
        setSelectedLocalityId(locId);

        let ctx = await fetchDeliveryContext(subId, locId);
        if (cancelled) return;
        let mapped = mapContextToStores(ctx.stores);

        if (
          mapped.length === 0 &&
          ctx.emptyReason === "no_public_stores_for_area" &&
          preferredSubId &&
          subId !== preferredSubId
        ) {
          subId = preferredSubId;
          setSelectedSubdivisionId(subId);
          const locsRetryRaw = await fetchGeoLocalities(subId, geoFetchOpts);
          if (cancelled) return;
          const locsRetry = filterLocalitiesForUi(locsRetryRaw);
          setLocalities(locsRetry);
          locId = null;
          setSelectedLocalityId(null);
          ctx = await fetchDeliveryContext(subId, null);
          if (cancelled) return;
          mapped = mapContextToStores(ctx.stores);
        }

        setDeliveryPolicy(ctx.policy);
        setEmptyReason(ctx.emptyReason);
        setStores(mapped);

        const persistedStore = readPersistedStoreId();
        const storeMatch = mapped.find((s) => s.id === persistedStore);
        if (storeMatch) {
          setSelectedStoreId(storeMatch.id);
          persistStoreId(storeMatch.id);
        } else if (mapped[0]) {
          setSelectedStoreId(mapped[0].id);
          persistStoreId(mapped[0].id);
        } else if (persistedStore) {
          setSelectedStoreId(persistedStore);
          persistStoreId(persistedStore);
        } else {
          setSelectedStoreId(null);
          persistStoreId(null);
        }

        persistServiceArea({
          countryId,
          subdivisionId: subId,
          localityId: locId,
        });
      } catch {
        setGeoFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadGeo();
    return () => {
      cancelled = true;
    };
  }, [useGeo, geoFailed]);

  const refreshContext = useCallback(
    async (
      countryId: string,
      subId: string | null,
      locId: string | null,
    ) => {
      if (!subId) {
        setStores([]);
        setDeliveryPolicy(null);
        setEmptyReason("no_public_stores_for_area");
        persistServiceArea(
          countryId && subId
            ? { countryId, subdivisionId: subId, localityId: locId }
            : null,
        );
        return;
      }
      try {
        const ctx = await fetchDeliveryContext(subId, locId);
        setDeliveryPolicy(ctx.policy);
        setEmptyReason(ctx.emptyReason);
        const mapped = mapContextToStores(ctx.stores);
        setStores(mapped);
        persistServiceArea({ countryId, subdivisionId: subId, localityId: locId });

        const cur = readPersistedStoreId();
        const stillValid = cur && mapped.some((s) => s.id === cur);
        if (stillValid && cur) {
          setSelectedStoreId(cur);
        } else if (mapped[0]) {
          setSelectedStoreId(mapped[0].id);
          persistStoreId(mapped[0].id);
        } else if (cur) {
          setSelectedStoreId(cur);
        } else {
          setSelectedStoreId(null);
          persistStoreId(null);
        }
        router.refresh();
      } catch {
        /* ignore */
      }
    },
    [router],
  );

  const setCountry = useCallback(
    async (id: string) => {
      setSelectedCountryId(id);
      setSelectedSubdivisionId(null);
      setSelectedLocalityId(null);
      setSubdivisions([]);
      setLocalities([]);
      setStores([]);
      setDeliveryPolicy(null);
      try {
        const subsRaw = await fetchGeoSubdivisions(id, geoFetchOpts);
        const subs = filterSubdivisionsForUi(subsRaw);
        setSubdivisions(subs);
        const first = pickDefaultSubdivisionId(subs);
        setSelectedSubdivisionId(first);
        if (first) {
          const locsRaw = await fetchGeoLocalities(first, geoFetchOpts);
          setLocalities(filterLocalitiesForUi(locsRaw));
          await refreshContext(id, first, null);
        } else {
          persistServiceArea(null);
        }
      } catch {
        /* ignore */
      }
    },
    [refreshContext],
  );

  const setSubdivision = useCallback(
    async (id: string) => {
      const cid = selectedCountryId;
      if (!cid) return;
      setSelectedSubdivisionId(id);
      setSelectedLocalityId(null);
      try {
        const locsRaw = await fetchGeoLocalities(id, geoFetchOpts);
        setLocalities(filterLocalitiesForUi(locsRaw));
        await refreshContext(cid, id, null);
      } catch {
        /* ignore */
      }
    },
    [selectedCountryId, refreshContext],
  );

  const setLocality = useCallback(
    async (id: string | null) => {
      const cid = selectedCountryId;
      const sid = selectedSubdivisionId;
      if (!cid || !sid) return;
      setSelectedLocalityId(id);
      await refreshContext(cid, sid, id);
    },
    [selectedCountryId, selectedSubdivisionId, refreshContext],
  );

  const selectStore = useCallback(
    (storeId: string) => {
      const match =
        stores.find((s) => s.id === storeId) ??
        storeCatalogRef.current.get(storeId) ??
        null;
      if (!match) return;
      storeCatalogRef.current.set(storeId, match);
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

  const selectedStore = useMemo(() => {
    if (!selectedStoreId) return null;
    const fromList = stores.find((s) => s.id === selectedStoreId);
    if (fromList) return fromList;
    return storeCatalogRef.current.get(selectedStoreId) ?? null;
  }, [stores, selectedStoreId]);

  const commerceStore = useMemo(() => {
    if (!features.multiStore) return null;
    if (!useGeo || geoFailed) return selectedStore;
    if (deliveryPolicy?.tier === "unserved") return null;
    if (stores.length === 0) return null;
    return (
      (selectedStoreId && stores.find((s) => s.id === selectedStoreId)) ||
      stores[0] ||
      null
    );
  }, [selectedStore, stores, selectedStoreId, deliveryPolicy?.tier, useGeo, geoFailed]);

  const canShopCurrentArea = useMemo(() => {
    if (!features.multiStore) return true;
    return commerceStore != null;
  }, [commerceStore]);

  const serviceAreaSlice: ServiceAreaSlice | undefined = useMemo(() => {
    if (!useGeo || geoFailed) return undefined;
    return {
      countries,
      subdivisions,
      localities,
      selectedCountryId,
      selectedSubdivisionId,
      selectedLocalityId,
      deliveryPolicy,
      emptyReason,
      setCountry,
      setSubdivision,
      setLocality,
    };
  }, [
    useGeo,
    geoFailed,
    countries,
    subdivisions,
    localities,
    selectedCountryId,
    selectedSubdivisionId,
    selectedLocalityId,
    deliveryPolicy,
    emptyReason,
    setCountry,
    setSubdivision,
    setLocality,
  ]);

  const value = useMemo<StoreContextType>(
    () => ({
      stores,
      selectedStore,
      commerceStore,
      canShopCurrentArea,
      previousStoreId: previousStoreIdRef.current,
      selectStore,
      clearSelection,
      isLoading,
      serviceArea: serviceAreaSlice,
    }),
    [
      stores,
      selectedStore,
      commerceStore,
      canShopCurrentArea,
      selectStore,
      clearSelection,
      isLoading,
      serviceAreaSlice,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
