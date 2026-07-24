"use client";

import { useState } from "react";
import { Tag, Plus, Edit, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCouponAction, toggleCouponAction, deleteCouponAction } from "@/lib/admin-actions";
import { toast } from "@/lib/toast-store";
import { useRouter } from "next/navigation";

export function CouponManager({ initialCoupons }: { initialCoupons: any[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const resetForm = () => {
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setMinOrderValue("");
    setMaxDiscount("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const res = await createCouponAction({
      code,
      type,
      value: Number(value),
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (res.success) {
      toast.success("Coupon created! Please refresh to see changes.");
      resetForm();
    } else {
      toast.error("Error: " + res.error);
    }
    setSubmitting(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleCouponAction(id, !current);
    setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !current } : c));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    const res = await deleteCouponAction(id);
    if (res.success) {
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Coupon deleted");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage discount codes and promotions</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="rounded-xl bg-magenta text-white hover:bg-magenta/90 font-bold uppercase h-12 px-6">
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-xl font-extrabold uppercase">Create New Coupon</h2>
            <Button type="button" variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Coupon Code *</label>
              <input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full h-12 px-4 rounded-xl border border-border bg-background uppercase font-bold" placeholder="e.g. SUMMER20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Type *</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Value *</label>
                <input required type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" placeholder={type === "PERCENTAGE" ? "20" : "500"} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Min Order Value (₹)</label>
                <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" placeholder="0" />
              </div>
              {type === "PERCENTAGE" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest">Max Discount (₹)</label>
                  <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" placeholder="Unlimited" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Start Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">End Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" />
              </div>
            </div>
          </div>
          
          <Button disabled={submitting} type="submit" size="lg" className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase px-8">
            {submitting ? "Saving..." : "Save Coupon"}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-full bg-magenta/10 text-magenta flex items-center justify-center">
                  <Tag className="h-5 w-5 -rotate-90" />
                </div>
                <button onClick={() => handleToggle(c.id, c.isActive)}>
                  {c.isActive ? (
                    <span className="inline-flex items-center text-xs font-bold text-success bg-success/10 px-2 py-1 rounded border border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded border border-border"><XCircle className="h-3 w-3 mr-1" /> Inactive</span>
                  )}
                </button>
              </div>
              <h3 className="font-extrabold text-2xl uppercase mb-1">{c.code}</h3>
              <p className="font-bold text-magenta text-lg mb-4">
                {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </p>
              
              <div className="space-y-1 text-xs text-muted-foreground font-medium">
                {c.minOrderValue && <p>Min. Spend: ₹{c.minOrderValue}</p>}
                {c.maxDiscount && c.type === "PERCENTAGE" && <p>Max Discount: ₹{c.maxDiscount}</p>}
                <p>Valid: {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="pt-4 mt-6 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{c.usedCount} Uses</span>
              <Button onClick={() => handleDelete(c.id)} variant="ghost" size="sm" className="h-8 rounded-lg text-destructive hover:bg-destructive/10 uppercase text-[10px]"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
