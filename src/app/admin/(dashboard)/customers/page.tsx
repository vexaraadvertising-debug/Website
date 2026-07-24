import { getAdvancedAdminCustomers } from "@/lib/admin-analytics-actions";
import { getNewsletterSubscribers } from "@/lib/newsletter-actions";
import { CustomersView } from "@/components/admin/customers-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();
  const currentTab = (resolvedParams.tab as string) || "registered";

  const res = await getAdvancedAdminCustomers(startDateStr, endDateStr);
  const customers = res.success && res.data ? res.data : [];
  const summary = res.summary || { total: 0, newCustomers: 0, activeCustomers: 0 };

  const subRes = await getNewsletterSubscribers();
  const subscribers = subRes.success && subRes.data ? subRes.data : [];

  return (
    <CustomersView 
      customers={customers} 
      summary={summary} 
      subscribers={subscribers}
      startDateStr={startDateStr} 
      endDateStr={endDateStr} 
      currentTab={currentTab}
    />
  );
}
