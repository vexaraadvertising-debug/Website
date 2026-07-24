import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSlider } from "@/components/home/categories-slider";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroStrip } from "@/components/home/hero-strip";

import { prisma } from "@/lib/prisma";

export default async function Home() {
  const activeSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { product: { include: { images: { orderBy: { order: 'asc' } } } } }
  });

  const serializedSlides = activeSlides.map((slide: any) => ({
    ...slide,
    product: slide.product ? {
      ...slide.product,
      basePrice: Number(slide.product.basePrice),
      originalPrice: slide.product.originalPrice ? Number(slide.product.originalPrice) : null,
    } : null
  }));

  return (
    <div className="flex flex-col min-h-screen pt-16 md:pt-20">
      <HeroSection slides={serializedSlides} />
      <HeroStrip />
      <FeaturedProducts title="Trending Now" layout="carousel" />
      <CategoriesSlider />
      <FeaturedProducts title="New Arrivals" layout="grid" />
      
    </div>
  );
}
