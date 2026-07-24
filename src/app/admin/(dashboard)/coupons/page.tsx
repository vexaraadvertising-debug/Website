import { getAdvancedAdminCoupons } from "@/lib/admin-analytics-actions-2";
import { CouponsView } from "@/components/admin/coupons-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAdminCoupons(startDateStr, endDateStr);
  
  const coupons = res.success && res.data ? res.data : [];
  const summary = res.summary || { total: 0, active: 0, usesInPeriod: 0, discountInPeriod: 0 };

  return <CouponsView coupons={coupons} summary={summary} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
