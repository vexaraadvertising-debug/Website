import { getProductBySlug } from "@/lib/actions";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const res = await getProductBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const product = res.data;

  return <ProductDetailView product={product} />;
}
