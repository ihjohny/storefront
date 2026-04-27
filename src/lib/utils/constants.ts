export const GUEST_ID_KEY = "bs-guest-id";
export const ITEMS_PER_PAGE = 12;
export const PRODUCT_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "basePrice", label: "Price: Low to High" },
  { value: "-basePrice", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
] as const;
