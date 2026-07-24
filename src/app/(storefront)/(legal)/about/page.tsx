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
          <span className="text-foreground font-medium">About Us</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-8 pb-4 border-b border-border">
            About Us
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-bold">
            <p className="mb-4 text-muted-foreground">Welcome to ORINKO! We are a premium oversized t-shirt brand dedicated to bringing you the best streetwear designs. Our collections span from minimalist aesthetics to bold anime prints and functional gym wear.</p>
            <p className="mb-4 text-muted-foreground">We believe that style is a personal statement, and our goal is to empower you to "Print Your Style". Every piece we create is crafted with high-quality fabrics and attention to detail, ensuring comfort and durability for everyday wear.</p>
            <p className="mb-4 text-muted-foreground">Thank you for choosing ORINKO.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
