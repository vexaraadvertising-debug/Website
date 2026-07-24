"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Truck, ShieldCheck, Undo2, Star } from "lucide-react";

export function HeroStrip() {
  const items = [
    { text: "Trusted by 1000+ Customers", icon: <Star className="h-4 w-4" /> },
    { text: "Premium Quality Cotton", icon: <CheckCircle2 className="h-4 w-4" /> },
    { text: "Free Shipping", icon: <Truck className="h-4 w-4" /> },
    { text: "Secure Payments", icon: <ShieldCheck className="h-4 w-4" /> },
    { text: "Easy Returns", icon: <Undo2 className="h-4 w-4" /> },
    { text: "Made in India", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full overflow-hidden bg-foreground text-background py-3 border-y border-foreground/10">
      <div className="flex whitespace-nowrap">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
          className="flex items-center space-x-12 px-6"
        >
          {/* Double the items to ensure seamless loop */}
          {[...items, ...items, ...items, ...items].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs opacity-90">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
