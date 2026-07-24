"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, IndianRupee, Users, ShoppingCart, Package } from "lucide-react";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardView({ data, startDateStr, endDateStr }: { data: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();
  const summary = data.summary;

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Live metrics from {new Date(startDateStr).toLocaleDateString()} to {new Date(endDateStr).toLocaleDateString()}</p>
        </div>
        <DateRangePicker onDateChange={handleDateChange} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Total Revenue</h3>
          <p className="text-3xl font-extrabold text-magenta">₹{summary.totalRevenue.toLocaleString("en-IN")}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Total Orders</h3>
          <p className="text-3xl font-extrabold">{summary.totalOrders}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Avg Order Value</h3>
          <p className="text-3xl font-extrabold">₹{summary.averageOrderValue.toFixed(0)}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Products Sold</h3>
          <p className="text-3xl font-extrabold">{summary.productsSold}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">New Customers</h3>
          <p className="text-3xl font-extrabold text-success">{summary.newCustomers}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Returning Customers</h3>
          <p className="text-3xl font-extrabold">{summary.returningCustomers}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Pending Orders</h3>
          <p className="text-3xl font-extrabold text-yellow">{summary.pendingOrders}</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Delivered Orders</h3>
          <p className="text-3xl font-extrabold text-success">{summary.deliveredOrders}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-extrabold uppercase tracking-tight mb-6">Revenue Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderRadius: '8px', border: '1px solid #333' }}
                  itemStyle={{ color: '#FF2D96', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#FF2D96" strokeWidth={3} dot={{ r: 4, fill: '#FF2D96' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-extrabold uppercase tracking-tight mb-6">Order Volume</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderRadius: '8px', border: '1px solid #333' }}
                  cursor={{ fill: '#333', opacity: 0.4 }}
                />
                <Bar dataKey="orders" fill="#fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-extrabold uppercase tracking-tight">Top Selling Products</h2>
          </div>
          <div className="p-0">
            {data.topProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No products sold in this period.</div>
            ) : (
              <ul className="divide-y divide-border">
                {data.topProducts.map((p: any, i: number) => (
                  <li key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20">
                    <div className="flex items-center gap-4">
                      {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-secondary" />}
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-magenta">₹{p.revenue.toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-extrabold uppercase tracking-tight">Top Categories</h2>
          </div>
          <div className="p-0">
            {data.topCategories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No category data for this period.</div>
            ) : (
              <ul className="divide-y divide-border">
                {data.topCategories.map((c: any, i: number) => (
                  <li key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20">
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.quantity} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-success">₹{c.revenue.toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
