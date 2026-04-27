import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getOrderById } from "@/lib/api/orders";
import { features } from "@/lib/config/features";
import { OrderDetail } from "@/components/account/order-detail";

type OrderDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token");

  if (!token) {
    redirect(`/${locale}/auth/login`);
  }

  try {
    const order = await getOrderById(id, {
      headers: {
        Cookie: `payload-token=${token.value}`,
      },
      cache: "no-store",
    });

    return (
      <OrderDetail order={order} locale={locale} isMultivendor={features.multivendor} />
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect(`/${locale}/auth/login`);
    }
    redirect(`/${locale}`);
  }
}
