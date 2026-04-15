export interface Store {
  id: string;
  name: string;
  slug: string | null;
  code: string;
  isActive: boolean;
  isPublicStore: boolean;
  /** Lower appears first when geography resolves stores */
  sortPriority?: number;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
  } | null;
  storeDetails?: {
    contactPhone?: string | null;
    contactEmail?: string | null;
    operatingHours?: string | null;
    coverageArea?: Array<{ value: string }> | null;
  } | null;
}
