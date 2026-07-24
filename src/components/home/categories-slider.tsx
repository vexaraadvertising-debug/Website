"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { getCategories } from "@/lib/actions";

const bgColors = [
  "bg-neutral-200 dark:bg-neutral-800",
  "bg-blue-100 dark:bg-blue-900",
  "bg-neutral-100 dark:bg-neutral-900",
  "bg-stone-200 dark:bg-stone-800",
  "bg-amber-100 dark:bg-amber-900/50",
  "bg-magenta/20"
];

export function CategoriesSlider() {
  const [categories, setCategories] = useState<any[]>([]);
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    async function load() {
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }
    load();
  }, []);

  return (
    <section ref={ref} className="py-12 md:py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Options */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
              Shop By <span className="text-magenta">Category</span>
            </h2>
          </motion.div>

          <div className="flex items-center gap-3">
            {categories.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    if (scrollRef.current) scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth * 0.75, behavior: "smooth" });
                  }}
                  className="rounded-full h-10 w-10 border-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.75, behavior: "smooth" });
                  }}
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
              {categories.map((category, index) => {
                const bg = bgColors[index % bgColors.length];
                return (
                  <div key={category.id || index} className="w-[200px] sm:w-[280px] lg:w-[320px] shrink-0 snap-start group cursor-pointer">
                    <Link href={`/category/${category.slug}`}>
                      <div className={`group relative aspect-[3/4] rounded-2xl overflow-hidden ${bg} flex flex-col justify-end p-5 md:p-6`}>
                        {category.imageUrl && (
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 280px, 320px"
                          />
                        )}
                        <div className={`absolute inset-0 transition-colors duration-300 ${category.imageUrl ? 'bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95' : 'bg-black/10 group-hover:bg-black/20'}`} />
                        <h3 className="relative z-10 text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white drop-shadow-md transition-all duration-500 pr-10 group-hover:-translate-y-1">
                          {category.name}
                        </h3>
                      
                      <div className="absolute bottom-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-20">
                        <ArrowRight className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </Link>
                </div>
              )})}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
