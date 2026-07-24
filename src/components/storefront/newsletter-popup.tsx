"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { subscribeNewsletter, checkSubscriptionStatus } from "@/lib/newsletter-actions";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAndShowPopup = async () => {
      // 1. Check local storage
      const hasDismissed = localStorage.getItem("newsletter_dismissed");
      const hasSubscribed = localStorage.getItem("newsletter_subscribed");
      
      if (hasDismissed || hasSubscribed) {
        return;
      }

      // 3. Show popup after exactly 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    };

    checkAndShowPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("newsletter_dismissed", "true");
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const res = await subscribeNewsletter(email);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Thanks for joining the ORINKO Club!");
      localStorage.setItem("newsletter_subscribed", "true");
      setIsOpen(false);
    } else {
      toast.error(res.error || "Something went wrong.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-200 sm:rounded-3xl animate-in fade-in zoom-in-95">
        <div className="absolute right-4 top-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4 py-4 px-2">
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Join the ORINKO Club</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Subscribe for exclusive drops, early access to sales, special offers, and 10% off your first order.
          </p>
          
          <form onSubmit={handleSubscribe} className="w-full mt-6 space-y-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-0 focus:border-magenta transition-all text-center font-medium"
            />
            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-magenta hover:bg-magenta/90 text-white font-bold tracking-widest uppercase text-base shadow-[0_10px_40px_rgba(255,45,150,0.2)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
            <button 
              type="button" 
              onClick={handleClose}
              className="w-full mt-2 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors py-2"
            >
              Maybe Later
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
