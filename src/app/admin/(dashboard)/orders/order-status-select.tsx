"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/admin-actions";
type OrderStatus = any;
import { toast } from "@/lib/toast-store";

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED"
];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    const res = await updateOrderStatus(orderId, newStatus);
    if (!res.success) {
      toast.error("Failed to update status: " + res.error);
    }
    setLoading(false);
  }

  return (
    <div className="relative">
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border appearance-none outline-none focus:ring-2 focus:ring-magenta cursor-pointer ${
          currentStatus === "DELIVERED" ? "bg-green-100 text-green-700 border-green-200" :
          currentStatus === "CANCELLED" || currentStatus === "REFUNDED" ? "bg-red-100 text-red-700 border-red-200" :
          "bg-magenta/10 text-magenta border-magenta/20"
        }`}
      >
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {loading && <span className="absolute right-[-20px] top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-magenta border-t-transparent rounded-full animate-spin" />}
    </div>
  );
}
