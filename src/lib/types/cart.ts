export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ id: string; url: string; alt: string }>;
    tenant?: { id: string; name: string; slug: string } | null;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
    options: Array<{ name: string; value: string }>;
    image: { url: string; alt: string } | null;
  } | null;
  quantity: number;
  unitPrice: number;
  vendor?: { id: string; name: string; slug: string } | null;
}

export interface Cart {
  id: string;
  user: string | null;
  guestId: string | null;
  items: CartItem[];
  subtotal: number;
  couponCode: string | null;
  store: string | { id: string; name: string } | null;
  expiresAt: string | null;
}
