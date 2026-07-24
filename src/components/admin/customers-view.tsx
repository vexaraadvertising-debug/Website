"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { ExportButtons } from "@/components/admin/export-buttons";
import { Check, X, Trash2 } from "lucide-react";
import { deleteSubscriber } from "@/lib/newsletter-actions";
import { toast } from "@/lib/toast-store";
import { Button } from "@/components/ui/button";

export function CustomersView({ customers, summary, subscribers, startDateStr, endDateStr, currentTab }: { customers: any[], summary: any, subscribers: any[], startDateStr: string, endDateStr: string, currentTab: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/customers?${params.toString()}`);
  };

  const columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "Orders (Total)", key: "totalOrders" },
    { header: "Spent (Total)", key: "totalSpent" },
    { header: "Orders (Period)", key: "ordersInPeriod" },
    { header: "Spent (Period)", key: "spentInPeriod" },
    { header: "Joined Date", key: "joined" },
  ];

  const subscriberColumns = [
    { header: "Email", key: "email" },
    { header: "Subscription Date", key: "createdAt" },
    { header: "Status", key: "status" },
  ];

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      const res = await deleteSubscriber(id);
      if (res.success) {
        toast.success(res.message || "Subscriber deleted");
      } else {
        toast.error(res.error || "Failed to delete subscriber");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Customers Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Track customer acquisition, activity, and lifetime value.</p>
        </div>
        <div className="flex items-center gap-2">
          {currentTab === "registered" ? (
            <>
              <ExportButtons data={customers} filename="Orinko_Customers" columns={columns} />
              <DateRangePicker onDateChange={handleDateChange} />
            </>
          ) : (
            <ExportButtons 
              data={subscribers.map(s => ({
                email: s.email,
                createdAt: new Date(s.createdAt).toLocaleDateString(),
                status: s.isActive ? "Subscribed" : "Unsubscribed"
              }))} 
              filename="Orinko_Newsletter_Subscribers" 
              columns={subscriberColumns} 
            />
          )}
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set("tab", "registered");
            router.push(`/admin/customers?${params.toString()}`);
          }}
          className={`px-6 py-3 font-bold text-sm tracking-widest uppercase transition-all border-b-2 ${
            currentTab === "registered"
              ? "border-magenta text-magenta"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Registered Customers
        </button>
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set("tab", "subscribers");
            router.push(`/admin/customers?${params.toString()}`);
          }}
          className={`px-6 py-3 font-bold text-sm tracking-widest uppercase transition-all border-b-2 ${
            currentTab === "subscribers"
              ? "border-magenta text-magenta"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Newsletter Subscribers
        </button>
      </div>

      {currentTab === "registered" && (
        <>
          {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Total Registered</h3>
          <p className="text-3xl font-extrabold">{summary.total}</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">New (In Period)</h3>
          <p className="text-3xl font-extrabold text-success">{summary.newCustomers}</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Active (In Period)</h3>
          <p className="text-3xl font-extrabold text-magenta">{summary.activeCustomers}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Orders (Total)</th>
                  <th className="px-6 py-4 text-right">Spent (Total)</th>
                  <th className="px-6 py-4 text-center text-magenta">Orders (Period)</th>
                  <th className="px-6 py-4 text-right text-magenta">Spent (Period)</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.isNew && (
                        <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20 mr-2">New</span>
                      )}
                      {c.ordersInPeriod > 0 && (
                        <span className="px-2 py-1 bg-magenta/10 text-magenta text-[10px] font-bold uppercase rounded-full border border-magenta/20">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{c.totalOrders}</td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{c.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-magenta bg-magenta/5">{c.ordersInPeriod}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-magenta bg-magenta/5">₹{c.spentInPeriod.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {currentTab === "subscribers" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {subscribers.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground font-medium">
              No subscribers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  <tr>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Subscription Date</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {subscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{s.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-secondary text-foreground text-[10px] font-bold uppercase rounded-full border border-border">Popup</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.isActive ? (
                          <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20">Subscribed</span>
                        ) : (
                          <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold uppercase rounded-full border border-destructive/20">Unsubscribed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => handleDeleteSubscriber(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
