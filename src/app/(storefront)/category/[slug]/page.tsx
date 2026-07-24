"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Filter, ChevronDown, Heart, ShoppingBag, PackageX } from "lucide-react";
import { useCartStore, WishlistItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recommended");
  const addItem = useCartStore((state) => state.addItem);
  const { wishlist, addToWishlist, removeFromWishlist } = useCartStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getProducts(slug);
      if (res.success && res.data) {
        let list = [...res.data];
        if (sortBy === "price-low") {
          list.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
        } else if (sortBy === "price-high") {
          list.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
        }
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }
    load();
  }, [slug, sortBy]);

  const categoryName = slug ? slug.replace("-", " ").toUpperCase() : "ALL COLLECTIONS";

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Top Header & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">
              {categoryName}
            </h1>
            <p className="text-muted-foreground font-medium">{products.length} products available</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Button variant="outline" className="rounded-full font-bold uppercase tracking-widest text-xs flex items-center">
                Sort: {sortBy} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={() => setSortBy("recommended")} className="text-left px-4 py-2 text-sm hover:bg-secondary rounded-lg font-bold">Recommended</button>
                  <button onClick={() => setSortBy("price-low")} className="text-left px-4 py-2 text-sm hover:bg-secondary rounded-lg font-bold">Price: Low to High</button>
                  <button onClick={() => setSortBy("price-high")} className="text-left px-4 py-2 text-sm hover:bg-secondary rounded-lg font-bold">Price: High to Low</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Product Grid (No Left Sidebar) */}
        {loading ? (
          <div className="py-24 text-center">
            <p className="text-muted-foreground font-bold uppercase tracking-widest">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center bg-card border border-border rounded-3xl p-12 max-w-lg mx-auto shadow-sm">
            <div className="h-20 w-20 rounded-full bg-magenta/10 text-magenta flex items-center justify-center mx-auto mb-6">
              <PackageX className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-2">No Products Available</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6">
              There are currently no products in the {categoryName} collection. New products added from the Admin Dashboard will automatically appear here.
            </p>
            <Link href="/shop">
              <Button className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest text-xs px-6">
                Explore All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const isWishlisted = wishlist.some((item: WishlistItem) => item.id === product.id);
              const mainImage = product.images?.[0]?.url || "/images/hero_model.jpg";
              const price = Number(product.basePrice);
              const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;

              return (
                <div key={product.id} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-secondary">
                    {product.isNew && (
                      <Badge className="absolute top-4 left-4 z-10 bg-magenta text-white border-none font-bold px-3 py-1">
                        NEW
                      </Badge>
                    )}
                    <button
                      onClick={() => {
                        if (isWishlisted) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist({
                            id: product.id,
                            name: product.name,
                            price: price,
                            image: mainImage,
                            category: slug || "Streetwear"
                          });
                        }
                      }}
                      className={`absolute top-4 right-4 z-10 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                        isWishlisted ? "bg-magenta text-white" : "bg-white/80 hover:bg-white text-black"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>

                    <Link href={`/product/${product.slug}`}>
                      <Image 
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-contain p-4 object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-extrabold text-lg uppercase tracking-tight line-clamp-1 group-hover:text-magenta transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xl">₹{price}</span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-muted-foreground line-through text-sm">₹{originalPrice}</span>
                        )}
                      </div>

                      <Button
                        size="icon"
                        className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white shrink-0"
                        onClick={() => {
                          addItem({
                            id: `${product.id}-default`,
                            productId: product.id,
                            name: product.name,
                            price: price,
                            originalPrice: originalPrice,
                            image: mainImage,
                            color: "Black",
                            size: "M",
                            quantity: 1
                          });
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
