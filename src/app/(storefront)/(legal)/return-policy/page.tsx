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
          <span className="text-foreground font-medium">Return Policy</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8 pb-4 border-b border-border">
            Return Policy
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-bold">
            <p className="mb-4 text-muted-foreground">If you are not satisfied with your purchase, you can return it within 7 days of delivery.</p>
            <p className="mb-4 text-muted-foreground">1. Return Process: To initiate a return, log into your account, go to your Order Details, and click "Request Return / Replacement".
2. Conditions: Items must be unused, in their original packaging, and with all tags intact.
3. Exchanges: We currently only offer returns. If you need a different size or color, please return the original item for a refund and place a new order.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
