import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const query = await searchParams;
  const orderId = Array.isArray(query.order) ? query.order[0] : query.order;

  return <CheckoutSuccessContent fallbackOrderId={orderId} />;
}
