import { getAdvancedAdminProducts } from "@/lib/admin-analytics-actions";
import { ProductsView } from "@/components/admin/products-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAdminProducts(startDateStr, endDateStr);
  
  const products = res.success && res.data ? res.data : [];
  const summary = res.summary || { total: 0, active: 0, outOfStock: 0, productsSoldInPeriod: 0, totalRevenueInPeriod: 0 };

  return <ProductsView products={products} summary={summary} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
