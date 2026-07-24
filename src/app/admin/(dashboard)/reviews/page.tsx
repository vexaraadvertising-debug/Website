import { getAdvancedAdminReviews } from "@/lib/admin-analytics-actions-2";
import { ReviewsView } from "@/components/admin/reviews-view";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Default to Last 30 Days if no dates provided
  const now = new Date();
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 29);

  const startDateStr = (resolvedParams.startDate as string) || defaultStart.toISOString();
  const endDateStr = (resolvedParams.endDate as string) || defaultEnd.toISOString();

  const res = await getAdvancedAdminReviews(startDateStr, endDateStr);
  
  const reviews = res.success && res.data ? res.data : [];
  const summary = res.summary || { total: 0, averageRating: "0.0", published: 0, fiveStar: 0 };

  return <ReviewsView reviews={reviews} summary={summary} startDateStr={startDateStr} endDateStr={endDateStr} />;
}
