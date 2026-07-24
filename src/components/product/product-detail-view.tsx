"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  ArrowLeftRight, 
  ChevronLeft,
  Plus,
  Minus,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useCartStore } from "@/lib/store";
import { toast } from "@/lib/toast-store";
import { useRouter } from "next/navigation";
import { ReviewSection } from "@/components/storefront/review-section";
import { FeaturedProducts } from "@/components/home/featured-products";

// Default fallback sizes & colours shown when product has no variants yet
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Grey", hex: "#9CA3AF" },
];
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function ProductDetailView({ product }: { product: any }) {
  const { addItem, setBuyNowItem, wishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const price = Number(product.basePrice);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const images = product.images?.length > 0 ? product.images.map((img: any) => img.url) : ["/images/hero_model.jpg"];
  const variants: any[] = product.variants || [];

  // --- Derive unique colours & sizes from variants, fallback to defaults ---
  const displayColors: { name: string; hex: string }[] = useMemo(() => {
    const seen = new Set<string>();
    const fromVariants = variants
      .filter((v) => v.color && !seen.has(v.color.name) && seen.add(v.color.name))
      .map((v) => ({ name: v.color.name, hex: v.color.hex || "#000000" }));
    return fromVariants.length > 0 ? fromVariants : DEFAULT_COLORS;
  }, [variants]);

  const displaySizes: string[] = useMemo(() => {
    const seen = new Set<string>();
    const found = variants
      .filter((v) => v.size && !seen.has(v.size.name) && seen.add(v.size.name))
      .map((v) => v.size.name);
    const sorted = found.length > 0
      ? [...SIZE_ORDER.filter((s) => found.includes(s)), ...found.filter((s) => !SIZE_ORDER.includes(s))]
      : DEFAULT_SIZES;
    return sorted;
  }, [variants]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(displayColors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState<string>(displaySizes[0] || "");
  const [quantity, setQuantity] = useState<number>(1);

  // Best-effort variant match (for inventory tracking only — does NOT block add-to-cart)
  const matchedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size?.name === selectedSize && v.color?.name === selectedColor
    ) || null;
  }, [variants, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      variantId: matchedVariant?.id, 
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      image: images[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity: quantity
    });
    // Toast is fired automatically from store
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      variantId: matchedVariant?.id, 
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      image: images[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity: quantity
    });
    router.push("/checkout?buyNow=true");
  };


  return (
    <div className="bg-background min-h-screen pt-24">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 md:px-6 py-6 border-b border-border">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-secondary/40 border border-border group">
              <Image 
                src={images[activeImage]} 
                alt={product.name} 
                fill 
                priority
                className="object-contain p-6 object-center cursor-crosshair hover:scale-105 transition-transform duration-500"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur"
                    onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur"
                    onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-24 w-24 rounded-2xl overflow-hidden border bg-secondary/40 shrink-0 transition-all ${activeImage === idx ? 'border-magenta ring-2 ring-magenta/20' : 'border-border'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold">₹{price}</span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{originalPrice}</span>
                    <span className="bg-magenta/10 text-magenta font-bold px-3 py-1 rounded-sm text-sm border border-magenta/20">
                      SAVE {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Inclusive of all taxes</p>
            </div>

            <div className="space-y-6 mb-8">

              {/* Color Selector */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold uppercase tracking-widest text-sm">Colour:</span>
                  <span className="text-sm font-semibold text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {displayColors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`h-12 min-w-[3rem] px-4 border rounded-xl font-bold transition-all text-sm cursor-pointer
                          ${isSelected ? "border-magenta bg-magenta/5 text-magenta shadow-sm" : "border-border hover:border-black dark:hover:border-white"}
                        `}
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-border mr-2 align-middle"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold uppercase tracking-widest text-sm">
                    Size: <span className="text-muted-foreground ml-1 font-semibold">{selectedSize}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {displaySizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 min-w-[3rem] px-4 border rounded-xl font-bold transition-all text-sm cursor-pointer
                          ${isSelected ? "border-magenta bg-magenta/5 text-magenta shadow-sm" : "border-border hover:border-black dark:hover:border-white"}
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold uppercase tracking-widest text-sm">Quantity:</span>
              </div>
              <div className="flex items-center border-2 border-border rounded-xl w-32 h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center hover:bg-secondary transition-colors text-foreground"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-base font-bold w-10 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-secondary transition-colors text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-10">
              <Button
                size="lg"
                className="w-full h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white dark:hover:bg-magenta dark:hover:text-white font-extrabold text-lg uppercase tracking-widest transition-all shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(255,45,150,0.3)]"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-16 rounded-2xl border-2 border-magenta text-magenta hover:bg-magenta hover:text-white font-extrabold text-lg uppercase tracking-widest transition-all shadow-[0_10px_40px_rgba(255,45,150,0.1)]"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                {isMounted && (
                  <Button
                    size="lg"
                    variant="outline"
                    className={`w-full h-16 rounded-2xl border-2 font-extrabold text-lg uppercase tracking-widest transition-all ${
                      wishlist.some(item => item.id === product.id)
                        ? "border-magenta bg-magenta text-white shadow-[0_10px_40px_rgba(255,45,150,0.3)]"
                        : "border-border hover:border-magenta hover:text-magenta"
                    }`}
                    onClick={() => {
                      const isWishlisted = wishlist.some(item => item.id === product.id);
                      if (isWishlisted) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist({
                          id: product.id,
                          name: product.name,
                          price: Number(product.basePrice),
                          image: images[0] || "",
                          category: product.categories?.[0]?.name || "Product"
                        });
                      }
                    }}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${wishlist.some(item => item.id === product.id) ? "fill-current" : ""}`} />
                    Wishlist
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center p-3 border border-border rounded-xl bg-secondary/50">
                  <Truck className="h-4 w-4" /> Free Shipping
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center p-3 border border-border rounded-xl bg-secondary/50">
                  <ArrowLeftRight className="h-4 w-4" /> 7-Day Returns
                </div>
              </div>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full border-t border-border">
              <AccordionItem value="description">
                <AccordionTrigger className="text-lg font-bold hover:text-magenta transition-colors">Description</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-4">{product.description}</p>
                  {product.details && product.details.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2">
                      {product.details.map((detail: string, i: number) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-lg font-bold hover:text-magenta transition-colors">Shipping & Returns</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-2"><strong>Free standard shipping</strong> on all orders across India.</p>
                  <p className="mb-2">Delivery typically takes 3-5 business days depending on your location.</p>
                  <p>We offer a hassle-free 7-day return policy.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Reviews */}
        <ReviewSection productId={product.id} initialReviews={product.reviews || []} />
      </div>

      {/* Related Products */}
      <div className="bg-secondary/30 mt-12">
        <FeaturedProducts title="You May Also Like" />
      </div>
    </div>
  );
}
