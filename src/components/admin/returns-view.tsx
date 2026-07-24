"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { ExportButtons } from "@/components/admin/export-buttons";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { ReturnRowActions } from "./return-row-actions";

export function ReturnsView({ returns, summary, startDateStr, endDateStr }: { returns: any[], summary: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/returns?${params.toString()}`);
  };

  const columns = [
    { header: "Order Number", key: "orderNumber" },
    { header: "Customer Name", key: "customerName" },
    { header: "Product", key: "productName" },
    { header: "Type", key: "type" },
    { header: "Status", key: "status" },
    { header: "Reason", key: "reason" },
    { header: "Date", key: "createdAt" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Returns & Replacements</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage customer return and replacement requests</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={returns} filename="Orinko_Returns" columns={columns} />
          <DateRangePicker onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Total Requests</h3>
          <p className="text-2xl font-extrabold">{summary.total}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Pending</h3>
          <p className="text-2xl font-extrabold text-yellow">{summary.pending}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Approved</h3>
          <p className="text-2xl font-extrabold text-success">{summary.approved}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Rejected</h3>
          <p className="text-2xl font-extrabold text-destructive">{summary.rejected}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {returns.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No returns found in this date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <Link href={`/admin/orders/${r.orderId}`} className="hover:underline text-magenta">
                        #{r.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{r.customerName}</td>
                    <td className="px-6 py-4">{r.productName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${r.type === 'REFUND' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate">{r.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`flex w-fit items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${r.status === 'PENDING' ? 'bg-yellow/10 text-yellow border-yellow/20' : r.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' : r.status === 'REJECTED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary/50 text-muted-foreground'}`}>
                        {r.status === 'PENDING' && <RefreshCw className="h-3 w-3 animate-spin" />}
                        {r.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                        {r.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{r.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <ReturnRowActions returnReq={r} />
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
