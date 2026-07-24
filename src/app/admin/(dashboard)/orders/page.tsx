import { getAdvancedAdminOrders } from "@/lib/admin-analytics-actions";
import { OrdersView } from "@/components/admin/orders-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAdminOrders(startDateStr, endDateStr);
  
  const orders = res.success && res.data ? res.data : [];
  const summary = res.summary || { today: 0, thisWeek: 0, thisMonth: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 };

  return <OrdersView orders={orders} summary={summary} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
