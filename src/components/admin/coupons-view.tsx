"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { toast } from "@/lib/toast-store";
import { ExportButtons } from "@/components/admin/export-buttons";
import { Check, X } from "lucide-react";

export function CouponsView({ coupons, summary, startDateStr, endDateStr }: { coupons: any[], summary: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const columns = [
    { header: "Code", key: "code" },
    { header: "Discount", key: "discountValue" },
    { header: "Type", key: "discountType" },
    { header: "Uses (Period)", key: "usesInPeriod" },
    { header: "Discount Given (Period)", key: "discountInPeriod" },
    { header: "Active", key: "isActive" },
    { header: "Expires", key: "expiresAt" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Coupons Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Track promotional campaigns and discount usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={coupons} filename="Orinko_Coupons" columns={columns} />
          <DateRangePicker onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Total Coupons</h3>
          <p className="text-2xl font-extrabold">{summary.total}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Active Coupons</h3>
          <p className="text-2xl font-extrabold text-success">{summary.active}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Uses (Period)</h3>
          <p className="text-2xl font-extrabold text-magenta">{summary.usesInPeriod}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Discount Given (Period)</h3>
          <p className="text-2xl font-extrabold text-yellow">₹{summary.discountInPeriod.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No coupons found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4 text-center">Uses (Period)</th>
                  <th className="px-6 py-4 text-right">Discount (Period)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Expires</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-black tracking-widest text-foreground">{c.code}</td>
                    <td className="px-6 py-4 font-bold text-magenta">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-magenta bg-magenta/5">{c.usesInPeriod}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-yellow bg-yellow/5">₹{c.discountInPeriod.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      {c.isActive ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success/20 text-success"><Check className="h-4 w-4" /></span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/20 text-destructive"><X className="h-4 w-4" /></span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{c.expiresAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toast.error("Editing coupons is not yet supported in this version.")}
                        className="text-xs font-bold bg-secondary hover:bg-magenta hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </td>
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
