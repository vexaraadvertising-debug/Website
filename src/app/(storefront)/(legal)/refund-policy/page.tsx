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
          <span className="text-foreground font-medium">Refund Policy</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8 pb-4 border-b border-border">
            Refund Policy
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-bold">
            <p className="mb-4 text-muted-foreground">We want you to be completely satisfied with your purchase. If you are not entirely happy, we offer a straightforward refund policy.</p>
            <p className="mb-4 text-muted-foreground">1. Eligibility: Refunds are only issued for items returned in their original, unworn, and unwashed condition with tags attached.
2. Processing Time: Once we receive and inspect your returned item, we will process your refund within 5-7 business days.
3. Non-Refundable Items: Custom-printed or personalized items cannot be refunded unless they arrive defective or damaged.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
