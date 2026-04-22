export type ReverseGeocodeInput = {
  latitude: number;
  longitude: number;
};

/** Normalized from Nominatim `address` (jsonv2) for checkout prefill. */
export type GeocodedAddressDetails = {
  houseNumber: string | null;
  road: string | null;
  neighbourhood: string | null;
  suburb: string | null;
  city: string | null;
  cityDistrict: string | null;
  county: string | null;
  state: string | null;
  postcode: string | null;
  countryCode: string;
};

export type ReverseGeocodeSuccess = {
  ok: true;
  countryCode: string;
  /** Best single strings for admin matching (back-compat). */
  subdivisionHint: string;
  localityHint: string;
  /** Try in order to match a geo-locality (OSM may split names across city/suburb/county). */
  localityHintCandidates: string[];
  displayName: string;
  addressDetails: GeocodedAddressDetails;
};

export type ReverseGeocodeFailureCode =
  | "OUT_OF_COUNTRY"
  | "GEOCODER_ERROR"
  | "INVALID_INPUT"
  | "OUTSIDE_BOUNDS";

export type ReverseGeocodeFailure = {
  ok: false;
  code: ReverseGeocodeFailureCode;
  message?: string;
};

export type ReverseGeocodeResult = ReverseGeocodeSuccess | ReverseGeocodeFailure;

export type GeocoderProvider = {
  reverse(input: ReverseGeocodeInput): Promise<ReverseGeocodeResult>;
};
