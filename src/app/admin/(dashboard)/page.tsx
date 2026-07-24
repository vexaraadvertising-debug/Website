import { getAdvancedAnalyticsData } from "@/lib/admin-analytics-actions";
import { DashboardView } from "@/components/admin/dashboard-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAnalyticsData(startDateStr, endDateStr);
  const data = res.success && res.data ? res.data : {
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      productsSold: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      returnRequests: 0,
      approvedReturns: 0,
      rejectedReturns: 0,
      refundAmount: 0,
      couponsUsed: 0
    },
    topProducts: [],
    topCategories: [],
    chartData: []
  };

  return <DashboardView data={data} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
