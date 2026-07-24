"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag, Filter, ArrowUpDown, PackageX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/actions";
import { useCartStore, WishlistItem } from "@/lib/store";
import { Button } from "@/components/ui/button";

function ShopPageContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  
  const addItem = useCartStore((state) => state.addItem);
  const { wishlist, addToWishlist, removeFromWishlist } = useCartStore();

  const [categories, setCategories] = useState<any[]>([{ id: "all", name: "All Products" }]);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      
      const resProducts = await getProducts(selectedCategory === "all" ? undefined : selectedCategory, searchQuery || undefined);
      const resCategories = await getCategories();
      
      if (resCategories.success && resCategories.data) {
        setCategories([{ id: "all", name: "All Products" }, ...resCategories.data]);
      }

      if (resProducts.success && resProducts.data) {
        let list = [...resProducts.data];
        
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
  }, [selectedCategory, sortBy, searchQuery]);

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">Shop Categories</h1>
            <p className="text-muted-foreground mt-2 font-medium">Explore premium oversized streetwear, anime, and minimal designs.</p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card border border-border rounded-xl h-10 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id || cat.slug)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all border-2 ${
                (selectedCategory === (cat.id || cat.slug))
                  ? "border-magenta bg-magenta text-white shadow-md"
                  : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Full-Width Product Grid */}
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
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              There are currently no products in this category. New streetwear collections added from the Admin Dashboard will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isWishlisted = wishlist.some((item: WishlistItem) => item.id === product.id);
              const mainImage = product.images?.[0]?.url || "/images/hero_model.jpg";
              const price = Number(product.basePrice);
              const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;

              return (
                <div
                  key={product.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-secondary">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-contain p-4 object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {product.isNew && (
                      <span className="absolute top-3 left-3 bg-magenta text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                        NEW
                      </span>
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
                            category: "Streetwear"
                          });
                        }
                      }}
                      className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10 ${
                        isWishlisted ? "bg-magenta text-white" : "bg-white/80 hover:bg-white text-black"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/product/${product.slug}`} className="group-hover:text-magenta transition-colors">
                      <h3 className="font-extrabold text-lg uppercase tracking-tight line-clamp-1 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                      <span className="text-xl font-extrabold">₹{price}</span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
                      )}

                      <Button
                        size="icon"
                        className="ml-auto rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white shrink-0"
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
                            quantity: 1,
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 pb-16 bg-background flex justify-center"><div className="animate-pulse h-8 w-48 bg-secondary rounded-lg"></div></div>}>
      <ShopPageContent />
    </Suspense>
  );
}
