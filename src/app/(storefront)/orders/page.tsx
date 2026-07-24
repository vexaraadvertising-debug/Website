"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Download, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/lib/actions";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const res = await getUserOrders();
      if (res.success) {
        setOrders(res.data);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-4">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Order History</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Track and manage your past orders.</p>
          </div>
          <Link href="/account" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Account
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center p-16 border border-border border-dashed rounded-2xl bg-card">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold uppercase mb-2">No orders found</h3>
            <p className="text-muted-foreground text-sm mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop">
              <Button className="rounded-full bg-magenta text-white font-bold text-xs uppercase px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-lg">#{order.orderNumber}</span>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                      order.status === "DELIVERED" ? "bg-success/10 text-success border border-success/20" : "bg-magenta/10 text-magenta border border-magenta/20"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.paymentMethod}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'PAID' ? 'text-success' : 'text-magenta'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Placed on {order.date} • {order.itemsCount} item(s)</p>
                  <p className="text-xl font-extrabold text-foreground pt-1">₹{order.total}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href={`/api/invoices?orderId=${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button variant="outline" className="w-full rounded-xl border-2 font-bold text-xs uppercase">
                      <Download className="mr-2 h-4 w-4" /> Invoice
                    </Button>
                  </a>
                  <Link href={`/orders/${order.id}`} className="flex-1 sm:flex-initial">
                    <Button className="w-full rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold text-xs uppercase">
                      Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
