"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore, WishlistItem } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addItem } = useCartStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background flex justify-center">
        <div className="animate-pulse h-8 w-48 bg-secondary rounded-lg"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="h-24 w-24 rounded-full bg-magenta/10 flex items-center justify-center mb-6 text-magenta">
          <Heart className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-3">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm font-medium">
          Save your favorite streetwear, anime, and minimal oversized t-shirts to track them later.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest px-8">
            Explore Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Saved Wishlist</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">{wishlist.length} item(s) saved</p>
          </div>
          <button onClick={() => router.back()} className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item: WishlistItem) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-secondary">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover object-center"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/80 hover:bg-destructive hover:text-white text-black flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <span className="text-xs font-bold uppercase tracking-widest text-magenta mb-1">{item.category}</span>
                <h3 className="font-extrabold text-lg uppercase tracking-tight line-clamp-1 mb-3">{item.name}</h3>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-2xl font-extrabold">₹{item.price}</span>

                  <Button
                    className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase text-xs tracking-wider"
                    onClick={() => {
                      addItem({
                        id: `${item.id}-wishlist`,
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        color: "Black",
                        size: "M",
                        quantity: 1
                      });
                      removeFromWishlist(item.id);
                    }}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
