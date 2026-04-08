export interface AddressSnapshot {
  firstName: string;
  lastName: string;
  street1: string;
  street2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string | null;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "partially-shipped"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface SubOrder {
  id: string;
  subOrderNumber: string;
  tenant: { id: string; name: string; slug: string } | string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingTotal: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: { id: string; email: string } | string | null;
  guestEmail: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subOrders: SubOrder[];
  shippingAddress: AddressSnapshot;
  billingAddress: AddressSnapshot;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  paymentStatus: "unpaid" | "paid" | "partially-refunded" | "refunded";
  notes: string | null;
  placedAt: string;
}

export interface CheckoutRequest {
  cartId: string;
  shippingAddress: AddressSnapshot;
  billingAddress: AddressSnapshot;
  shippingMethodIds?: string[];
  guestEmail?: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentRedirectUrl: string;
  transaction: { id: string; status: string };
}
