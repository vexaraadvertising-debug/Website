"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection({ slides = [] }: { slides?: any[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const displaySlides = slides;

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [current, displaySlides.length]);

  const handlePrev = () => {
    if (displaySlides.length <= 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displaySlides.length <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev === displaySlides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Framer Motion Slide Variants (Smooth fade + slight slide)
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.8 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.8 },
      },
    }),
  };

  const currentSlide = displaySlides[current];
  if (!currentSlide) return null;

  const product = currentSlide.product;
  const desktopImage = currentSlide.desktopImage || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80";
  const mobileImage = currentSlide.mobileImage || desktopImage;
  const heading = currentSlide.heading || product?.name || "Premium Collection";
  const description = currentSlide.description || product?.description || "";
  const badge = currentSlide.badge;

  return (
    <section className="relative h-[55vh] md:h-[65vh] min-h-[500px] flex items-center overflow-hidden bg-background border-b border-border">
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image - Full width */}
            <div className="absolute inset-0">
              {/* Mobile Image */}
              <div className="block md:hidden absolute inset-0">
                <Image
                  src={mobileImage}
                  alt={heading}
                  fill
                  priority={current === 0}
                  loading={current === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover object-top"
                />
              </div>
              {/* Desktop Image */}
              <div className="hidden md:block absolute inset-0">
                <Image
                  src={desktopImage}
                  alt={heading}
                  fill
                  priority={current === 0}
                  loading={current === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Subtle Text Shadow/Gradient for readability */}
            {/* Desktop: subtle left-side gradient. Mobile: text shadow (handled on text container or subtle bottom gradient) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent z-10" />
            <div className="block md:hidden absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />

            {/* Typography Container */}
            <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-6 pb-12 md:pb-0 md:px-16 lg:px-24 z-20">
              <div className="max-w-xl space-y-4">
                {/* Badge */}
                {badge && (
                  <div>
                    <span className="inline-block px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border bg-background/40 text-foreground border-border/50 backdrop-blur-sm">
                      {badge}
                    </span>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-foreground drop-shadow-lg md:drop-shadow-none">
                    {heading}
                  </h2>
                </div>

                {/* Description */}
                {description && (
                  <p className="text-foreground/80 text-sm md:text-base font-medium leading-relaxed max-w-md line-clamp-3">
                    {description}
                  </p>
                )}

                {product && (
                  <div className="flex items-center gap-4 pt-2">
                    <p className="text-xl md:text-2xl font-extrabold">
                      ₹{Number(product.basePrice).toLocaleString('en-IN')}
                    </p>
                    {product.originalPrice && (
                      <p className="text-sm md:text-base text-muted-foreground line-through font-bold">
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {/* Button */}
                {product && (
                  <div className="pt-2">
                    <Link href={`/product/${product.slug}`}>
                      <Button className="rounded-full bg-magenta text-white hover:bg-magenta/90 font-extrabold uppercase tracking-widest text-xs h-12 px-8 shadow-md transition-all active:scale-95">
                        <ShoppingBag className="mr-2 h-4 w-4" /> Shop Now
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Arrows (Hidden on mobile for cleaner look) */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 z-30 p-3 rounded-full bg-background/30 border border-border/50 backdrop-blur-md hover:bg-magenta hover:border-magenta hover:text-white transition-all text-foreground pointer-events-auto"
            aria-label="Previous Slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 z-30 p-3 rounded-full bg-background/30 border border-border/50 backdrop-blur-md hover:bg-magenta hover:border-magenta hover:text-white transition-all text-foreground pointer-events-auto"
            aria-label="Next Slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current ? "w-8 bg-magenta" : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
