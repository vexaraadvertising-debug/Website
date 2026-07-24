import { getAdvancedAdminReturns } from "@/lib/admin-analytics-actions";
import { ReturnsView } from "@/components/admin/returns-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReturnsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAdminReturns(startDateStr, endDateStr);
  
  const returns = res.success && res.data ? res.data : [];
  const summary = res.summary || { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, refunds: 0, replacements: 0 };

  return <ReturnsView returns={returns} summary={summary} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
