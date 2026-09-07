export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  classId: string;
  className: string;
  classSlug: string;
  key: string;
  label: string;
  type: string;
  unit?: string | null;
  displayOrder: number;
  options: FacetOption[];
}

export interface ClassParameter {
  key: string;
  label: string;
  type: string;
  unit?: string | null;
  isFilterable: boolean;
  isRequired: boolean;
  displayOrder: number;
  options: FacetOption[];
}

export interface ClassFacetsResult {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parameters: ClassParameter[];
}

export interface FacetsResponse {
  classes: ClassFacetsResult[];
  facets: FacetGroup[];
}
