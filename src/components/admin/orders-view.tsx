"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { ExportButtons } from "@/components/admin/export-buttons";
import { OrderStatusSelect } from "@/app/admin/(dashboard)/orders/order-status-select";

export function OrdersView({ orders, summary, startDateStr, endDateStr }: { orders: any[], summary: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  const columns = [
    { header: "Order Number", key: "orderNumber" },
    { header: "Customer Name", key: "customerName" },
    { header: "Email", key: "customerEmail" },
    { header: "Date", key: "createdAt" },
    { header: "Items", key: "itemsCount" },
    { header: "Total Amount", key: "total" },
    { header: "Payment Method", key: "paymentMethod" },
    { header: "Payment Status", key: "paymentStatus" },
    { header: "Order Status", key: "status" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Track customer purchases and fulfillment status</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={orders} filename="Orinko_Orders" columns={columns} />
          <DateRangePicker onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Today's Orders</h3>
          <p className="text-2xl font-extrabold text-magenta">{summary.today}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">This Week</h3>
          <p className="text-2xl font-extrabold">{summary.thisWeek}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Pending Processing</h3>
          <p className="text-2xl font-extrabold text-yellow">{summary.pending + summary.processing}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Delivered (Total)</h3>
          <p className="text-2xl font-extrabold text-success">{summary.delivered}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No orders found in this date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">#{o.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{o.createdAt}</td>
                    <td className="px-6 py-4 font-bold">{o.itemsCount} items</td>
                    <td className="px-6 py-4 font-extrabold text-magenta">₹{o.total}</td>
                    <td className="px-6 py-4">
                      <div className="uppercase text-xs font-bold">{o.paymentMethod}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${o.paymentStatus === 'SUCCESS' ? 'text-success' : 'text-muted-foreground'}`}>{o.paymentStatus}</div>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${o.id}`}>
                        <button className="text-xs font-bold bg-secondary hover:bg-magenta hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors">
                          View Details
                        </button>
                      </Link>
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
