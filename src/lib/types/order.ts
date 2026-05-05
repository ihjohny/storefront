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
  vendorNameSnapshot?: string | null;
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
  tenantNameSnapshot?: string | null;
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

export interface BuyerSnapshot {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  locale?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: { id: string; email: string } | string | null;
  guestEmail: string | null;
  buyerSnapshot?: BuyerSnapshot | null;
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
  /** Recorded at checkout (admin read-only after create). */
  checkoutPaymentChannel?: "online" | "cash_on_delivery";
  notes: string | null;
  placedAt: string;
}

export interface CheckoutRequest {
  cartId: string;
  shippingAddress: AddressSnapshot;
  billingAddress: AddressSnapshot;
  shippingMethodIds?: string[];
  guestEmail?: string;
  guestPhone?: string;
  simulatePayment?: boolean;
  cashOnDelivery?: boolean;
}

export interface CheckoutOrderSummary {
  id: string;
  orderNumber: string;
  items?: Array<{
    productName: string;
    variantName?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  grandTotal?: number;
  subtotal?: number;
  currency?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress?: AddressSnapshot;
  checkoutPaymentChannel?: "online" | "cash_on_delivery";
  paymentStatus?: "unpaid" | "paid" | "partially-refunded" | "refunded";
}

export interface CheckoutResponse {
  order: CheckoutOrderSummary;
  transaction?: { id: string };
  paymentRedirectUrl?: string;
}
