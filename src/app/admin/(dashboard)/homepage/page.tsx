import { prisma } from "@/lib/prisma";
import HomepageManagerClient from "@/components/admin/homepage-manager";

export default async function HomepageManagerPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
    include: { product: { include: { images: true } } }
  });

  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: "asc" }
  });

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      images: { where: { isPrimary: true }, take: 1 }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Homepage Manager</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Manage hero slides and storefront sections.</p>
      </div>
      
      <HomepageManagerClient initialSlides={slides} initialSections={sections} allProducts={allProducts} />
    </div>
  );
}
