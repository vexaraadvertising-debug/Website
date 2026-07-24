"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Package, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-background min-h-[80vh] flex items-center justify-center py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Success Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success via-magenta to-yellow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-success/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center relative">
              <CheckCircle2 className="h-12 w-12 text-success relative z-10" />
              <div className="absolute inset-0 rounded-full border-4 border-success animate-ping opacity-20" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for shopping with ORINKO. Your order <span className="font-bold text-foreground">#ORD-{Math.floor(100000 + Math.random() * 900000)}</span> has been placed successfully.
          </p>

          <div className="bg-secondary/30 rounded-2xl p-6 text-left mb-10 max-w-lg mx-auto">
            <h3 className="font-extrabold uppercase tracking-widest mb-4 border-b border-border pb-2 text-sm">Order Status</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-bold text-sm">Order Placed</p>
                  <p className="text-xs text-muted-foreground">We have received your order</p>
                </div>
              </div>
              <div className="flex gap-4 opacity-40">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-sm">Processing</p>
                  <p className="text-xs text-muted-foreground">We are preparing your items</p>
                </div>
              </div>
              <div className="flex gap-4 opacity-40">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-sm">Shipped</p>
                  <p className="text-xs text-muted-foreground">Your order is on the way</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/orders" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full rounded-full font-bold uppercase tracking-widest">
                Track Order
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-full bg-magenta hover:bg-magenta/90 text-white font-bold uppercase tracking-widest">
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
