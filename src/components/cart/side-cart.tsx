"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function SideCart() {
  const { items, removeItem, updateQuantity, getTotals, isCartOpen, setIsCartOpen } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totals = getTotals();

  if (!isMounted) return null;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative h-9 w-9 md:h-10 md:w-10"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-magenta text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-black">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </Button>

      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] sm:w-[400px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-border ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-border bg-white dark:bg-black z-10">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight flex items-center">
            Your Cart <span className="ml-3 bg-black text-white dark:bg-white dark:text-black rounded-full h-7 w-7 flex items-center justify-center text-sm">{items.length}</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-950">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground py-10">
              <div className="h-28 w-28 rounded-full bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-700" />
              </div>
              <p className="text-xl font-bold text-foreground">Your cart is empty</p>
              <p className="text-sm">Looks like you haven't added anything yet.</p>
              <Button onClick={() => setIsCartOpen(false)} className="mt-4 rounded-full bg-black text-white hover:bg-black/90 uppercase tracking-widest font-bold px-8 py-6 text-sm">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group bg-white dark:bg-black p-4 rounded-xl border border-border shadow-sm">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/product/${item.productId}`} onClick={() => setIsCartOpen(false)}>
                          <h3 className="font-bold text-sm sm:text-base hover:text-magenta transition-colors line-clamp-2 pr-4">
                            {item.name}
                          </h3>
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.color && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            Color: {item.color}
                          </span>
                        )}
                        {item.color && item.size && <span className="text-muted-foreground text-xs">•</span>}
                        {item.size && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden h-8">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 h-full hover:bg-secondary transition-colors flex items-center justify-center"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 h-full hover:bg-secondary transition-colors flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right flex flex-col">
                        <span className="font-black text-base text-magenta">₹{(item.price * item.quantity).toLocaleString()}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs font-bold text-muted-foreground line-through">
                            ₹{(item.originalPrice * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-border p-6 bg-white dark:bg-black z-20">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-success font-bold">
                  <span>Discount</span>
                  <span>-₹{totals.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xl pt-2 border-t border-border mt-2">
                <span>Total</span>
                <span>₹{totals.total.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <Button className="w-full h-12 rounded-xl bg-magenta hover:bg-magenta/90 text-white font-bold text-base uppercase tracking-widest transition-all">
                Proceed to Checkout
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
