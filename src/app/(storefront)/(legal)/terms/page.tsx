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
          <span className="text-foreground font-medium">Terms & Conditions</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8 pb-4 border-b border-border">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-bold">
            <p className="mb-4 text-muted-foreground">By accessing and using the ORINKO website, you agree to be bound by these Terms and Conditions.</p>
            <p className="mb-4 text-muted-foreground">1. Use of Website: You must be at least 18 years old to use this website or have permission from a legal guardian.
2. Products and Pricing: We reserve the right to modify prices and product offerings without prior notice.
3. Intellectual Property: All content on this website, including designs and logos, is the property of ORINKO.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
