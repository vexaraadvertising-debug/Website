"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotals, coupon, applyCoupon, removeCoupon } = useCartStore();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const totals = getTotals();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const success = applyCoupon(couponCode);
    if (!success) {
      setCouponError("Invalid coupon code. Try 'ORINKO10' for 10% off.");
    } else {
      setCouponCode("");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm font-medium">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Shopping Cart</h1>
          <button onClick={() => router.back()} className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-lg uppercase tracking-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold mb-3">
                    Color: <span className="text-foreground">{item.color}</span> | Size: <span className="text-foreground">{item.size}</span>
                  </p>
                  <p className="font-extrabold text-xl">₹{item.price * item.quantity}</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-border rounded-xl bg-background">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:text-magenta transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:text-magenta transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6">Order Summary</h2>

              {/* Coupon Form */}
              <div className="mb-6">
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 text-success rounded-xl text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>COUPON: {coupon.code} (-{coupon.discountPercentage}%)</span>
                    </div>
                    <button onClick={removeCoupon} className="hover:underline text-xs">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. ORINKO10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-magenta"
                    />
                    <Button type="submit" variant="outline" className="h-10 text-xs font-bold uppercase rounded-xl">
                      Apply
                    </Button>
                  </form>
                )}
                {couponError && <p className="text-xs text-destructive mt-2 font-medium">{couponError}</p>}
              </div>

              <div className="space-y-3 text-sm border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Discount</span>
                    <span>-₹{totals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Shipping</span>
                  <span className="text-success font-bold uppercase text-xs">FREE</span>
                </div>
                <div className="flex justify-between font-extrabold text-2xl pt-4 border-t border-border">
                  <span>Total</span>
                  <span className="text-magenta">₹{totals.total}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full h-14 rounded-xl bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase tracking-widest text-base shadow-lg">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
