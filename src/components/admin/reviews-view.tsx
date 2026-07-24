"use client";

import { useRouter } from "next/navigation";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { ExportButtons } from "@/components/admin/export-buttons";
import { Star } from "lucide-react";

export function ReviewsView({ reviews, summary, startDateStr, endDateStr }: { reviews: any[], summary: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const columns = [
    { header: "Customer Name", key: "customerName" },
    { header: "Product", key: "productName" },
    { header: "Rating", key: "rating" },
    { header: "Title", key: "title" },
    { header: "Review", key: "content" },
    { header: "Published", key: "isPublished" },
    { header: "Date", key: "createdAt" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Reviews Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Monitor customer feedback and ratings.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={reviews} filename="Orinko_Reviews" columns={columns} />
          <DateRangePicker onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Total Reviews (Period)</h3>
          <p className="text-2xl font-extrabold">{summary.total}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Average Rating</h3>
          <p className="text-2xl font-extrabold text-magenta flex items-center gap-1">
            {summary.averageRating} <Star className="h-5 w-5 fill-magenta text-magenta" />
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">5-Star Reviews</h3>
          <p className="text-2xl font-extrabold text-success">{summary.fiveStar}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Published</h3>
          <p className="text-2xl font-extrabold text-blue-500">{summary.published}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No reviews found in this date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Rating</th>
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{r.customerName}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[150px] truncate">{r.productName}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5 text-yellow">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="font-bold truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.content}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.isPublished ? (
                        <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20">Published</span>
                      ) : (
                        <span className="px-2 py-1 bg-secondary text-muted-foreground text-[10px] font-bold uppercase rounded-full border border-border">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
