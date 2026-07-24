"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Shipping Policy</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8 pb-4 border-b border-border">
            Shipping Policy
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-bold">
            <p className="mb-4 text-muted-foreground">ORINKO offers reliable shipping to get your favorite styles to you as quickly as possible.</p>
            <p className="mb-4 text-muted-foreground">1. Processing Time: Orders are typically processed within 1-2 business days.
2. Shipping Rates: We offer Free Standard Shipping on all orders. Express shipping is available for an additional fee.
3. Delivery Estimates: Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
