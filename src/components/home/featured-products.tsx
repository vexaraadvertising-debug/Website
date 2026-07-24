"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, PackageX, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions";
import { useCartStore } from "@/lib/store";
import { toast } from "@/lib/toast-store";

interface FeaturedProductsProps {
  title: string;
  layout?: "grid" | "carousel";
}

export function FeaturedProducts({ title, layout = "grid" }: FeaturedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, wishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getProducts();
      if (res.success && res.data) {
        // Fetch 12 products for carousel, 4 for standard grid
        const limit = layout === "carousel" ? 12 : 4;
        setProducts(res.data.slice(0, limit));
      } else {
        setProducts([]);
      }
      setLoading(false);
    }
    load();
  }, [layout]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  const getProductLabel = (product: any) => {
    if (product.isNew) return { text: "New", class: "bg-emerald-500 text-white" };
    const price = Number(product.basePrice);
    const origPrice = product.originalPrice ? Number(product.originalPrice) : 0;
    if (origPrice > price) return { text: "Best Seller", class: "bg-magenta text-white" };
    if (price > 999) return { text: "Limited", class: "bg-amber-500 text-white" };
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section ref={ref} className="py-12 md:py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm font-semibold">Premium styles just for you.</p>
          </motion.div>

          <div className="flex items-center gap-3">
            {layout === "carousel" && products.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => scroll("left")}
                  className="rounded-full h-10 w-10 border-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => scroll("right")}
                  className="rounded-full h-10 w-10 border-2"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            <Link href="/shop">
              <Button variant="outline" className="rounded-full uppercase tracking-widest font-extrabold text-xs h-10 px-5 border-2 hover:bg-magenta hover:text-white transition-all hover:border-magenta">
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 md:py-16 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-magenta animate-ping" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 md:py-16 text-center bg-card border border-border rounded-3xl p-8 max-w-md mx-auto">
            <PackageX className="h-10 w-10 text-magenta mx-auto mb-3" />
            <h4 className="font-extrabold uppercase text-lg mb-1">No Products Found</h4>
            <p className="text-xs text-muted-foreground">Add products to your catalog to view them here.</p>
          </div>
        ) : layout === "carousel" ? (
          /* Horizontal Carousel Scroll Container */
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {products.map((product) => {
              const mainImage = product.images?.[0]?.url || "/images/hero_model.jpg";
              const price = Number(product.basePrice);
              const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
              const label = getProductLabel(product);

              return (
                <div 
                  key={product.id} 
                  className="w-[200px] sm:w-[280px] lg:w-[320px] shrink-0 snap-start group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-4">
                    {label && (
                      <Badge className={`absolute top-4 left-4 z-10 font-black px-3 py-1 text-[10px] uppercase border-none rounded-full tracking-widest shadow-sm ${label.class}`}>
                        {label.text}
                      </Badge>
                    )}
                    {isMounted && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const isWishlisted = wishlist.some(item => item.id === product.id);
                          if (isWishlisted) {
                            removeFromWishlist(product.id);
                          } else {
                            addToWishlist({
                              id: product.id,
                              name: product.name,
                              price: price,
                              image: mainImage,
                              category: "Product"
                            });
                          }
                        }}
                        className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-20 ${
                          wishlist.some(item => item.id === product.id) ? "bg-magenta text-white" : "bg-white/80 hover:bg-white text-black"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.some(item => item.id === product.id) ? "fill-current" : ""}`} />
                      </button>
                    )}
                    <Link href={`/product/${product.slug}`}>
                      <Image 
                        src={mainImage}
                        alt={product.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 280px, 320px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-4 bottom-4 z-10 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product.id + "-default",
                            productId: product.id,
                            name: product.name,
                            price: price,
                            originalPrice: originalPrice,
                            image: mainImage,
                            color: "Black",
                            size: "M",
                            quantity: 1
                          });
                          toast.success("Added to cart!");
                        }}
                        className="w-full bg-white/95 hover:bg-white text-black font-extrabold h-12 rounded-xl uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="h-4 w-4" /> Quick Add
                      </Button>
                    </div>
                  </div>

                  <Link href={`/product/${product.slug}`} className="block px-1">
                    <h3 className="font-extrabold text-sm md:text-base truncate group-hover:text-magenta transition-colors mb-1 uppercase tracking-tight">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm md:text-base">₹{price}</span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-muted-foreground line-through text-[10px] md:text-xs font-semibold">₹{originalPrice}</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Grid Layout */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8"
          >
            {products.map((product) => {
              const mainImage = product.images?.[0]?.url || "/images/hero_model.jpg";
              const price = Number(product.basePrice);
              const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
              const label = getProductLabel(product);

              return (
                <motion.div key={product.id} variants={itemVariants} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-4">
                    {label && (
                      <Badge className={`absolute top-4 left-4 z-10 font-black px-3 py-1 text-[10px] uppercase border-none rounded-full tracking-widest shadow-sm ${label.class}`}>
                        {label.text}
                      </Badge>
                    )}
                    {isMounted && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const isWishlisted = wishlist.some(item => item.id === product.id);
                          if (isWishlisted) {
                            removeFromWishlist(product.id);
                          } else {
                            addToWishlist({
                              id: product.id,
                              name: product.name,
                              price: price,
                              image: mainImage,
                              category: "Product"
                            });
                          }
                        }}
                        className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-20 ${
                          wishlist.some(item => item.id === product.id) ? "bg-magenta text-white" : "bg-white/80 hover:bg-white text-black"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.some(item => item.id === product.id) ? "fill-current" : ""}`} />
                      </button>
                    )}
                    <Link href={`/product/${product.slug}`}>
                      <Image 
                        src={mainImage}
                        alt={product.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-4 bottom-4 z-10 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product.id + "-default",
                            productId: product.id,
                            name: product.name,
                            price: price,
                            originalPrice: originalPrice,
                            image: mainImage,
                            color: "Black",
                            size: "M",
                            quantity: 1
                          });
                          toast.success("Added to cart!");
                        }}
                        className="w-full bg-white/95 hover:bg-white text-black font-extrabold h-12 rounded-xl uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="h-4 w-4" /> Quick Add
                      </Button>
                    </div>
                  </div>

                  <Link href={`/product/${product.slug}`} className="block px-1">
                    <h3 className="font-extrabold text-sm md:text-base truncate group-hover:text-magenta transition-colors mb-1 uppercase tracking-tight">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm md:text-base">₹{price}</span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-muted-foreground line-through text-[10px] md:text-xs font-semibold">₹{originalPrice}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
