export type ServiceTier = "standard" | "extended" | "unserved";

export type GeoCountryListItem = {
  id: string;
  name: string;
  isoCode: string;
};

export type GeoSubdivisionListItem = {
  id: string;
  name: string;
  code: string | null;
  defaultServiceTier?: string;
};

export type GeoLocalityListItem = {
  id: string;
  name: string;
  code: string | null;
  serviceTier?: string;
};

export type DeliveryPolicy = {
  tier: ServiceTier;
  extendedFeeNote: string | null;
  extendedLeadTimeNote: string | null;
  unservedCustomerMessage: string | null;
};

export type DeliveryContextResponse = {
  policy: DeliveryPolicy;
  subdivision: { id: string; name: string } | null;
  locality: { id: string; name: string } | null;
  stores: Array<{
    id: string;
    name: string;
    slug: string | null;
    code: string;
    sortPriority: number;
    tenant: unknown;
    address: unknown;
  }>;
  emptyReason: "none" | "no_public_stores_for_area" | "unserved_area";
};

export type PersistedServiceArea = {
  countryId: string;
  subdivisionId: string;
  localityId: string | null;
};
