"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast-store";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-6 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-sm border">
                <Image 
                  src="/images/logo.png" 
                  alt="ORINKO Print Your Style" 
                  width={250} 
                  height={100}
                  className="h-12 w-auto object-contain" 
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 font-bold tracking-widest uppercase">Print Your Style</p>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm leading-relaxed">
              Premium oversized t-shirts made for everyday streetwear. Discover our minimal, anime, and gym collections.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-magenta transition-colors text-xs font-bold">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-magenta transition-colors text-xs font-bold">
                FB
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-magenta transition-colors text-xs font-bold">
                YT
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="mailto:support@orinko.in" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Policies</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Subscribe for exclusive drops and special offers.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.info("Thank you for subscribing!"); }} className="flex gap-2">
              <Input type="email" placeholder="Email address" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-magenta" />
              <Button type="submit" size="icon" className="bg-magenta hover:bg-magenta/90 text-white shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ORINKO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
