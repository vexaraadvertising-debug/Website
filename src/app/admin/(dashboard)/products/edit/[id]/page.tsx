"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImageAction, getCategories } from "@/lib/actions";
import { getAdminProductById, updateAdminProduct } from "@/lib/admin-actions";
import { VariantsManager } from "@/components/admin/variants-manager";
import { toast } from "@/lib/toast-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    originalPrice: "",
    categorySlug: "oversized",
    isNew: true,
    isActive: true,
  });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      const res = await getAdminProductById(productId);
      if (res.success && res.data) {
        const p = res.data;
        setFormData({
          name: p.name,
          slug: p.slug,
          description: p.description,
          basePrice: p.basePrice.toString(),
          originalPrice: p.originalPrice ? p.originalPrice.toString() : "",
          categorySlug: p.categorySlug || "oversized",
          isNew: p.isNew,
          isActive: p.isActive,
        });
        setImageUrl(p.imageUrl);
        setPublicId(p.publicId);
        setProductSlug(p.slug);
      } else {
        toast.error("Failed to load product: " + (res.error || "Product not found"));
        router.push("/admin/products");
      }
      setFetching(false);
    }
    loadProduct();
  }, [productId, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    const res = await uploadProductImageAction(data);
    if (res.success && res.secure_url) {
      setImageUrl(res.secure_url);
      setPublicId(res.public_id || "");
    } else {
      toast.error("Failed to upload image to Cloudinary: " + (res.error || "Unknown Error"));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice) {
      toast.error("Product name and price are required");
      return;
    }

    setLoading(true);
    const res = await updateAdminProduct(productId, {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      categorySlug: formData.categorySlug,
      imageUrl: imageUrl || undefined,
      publicId: publicId || undefined,
      isNew: formData.isNew,
      isActive: formData.isActive,
    });

    if (res.success) {
      router.push("/admin/products");
    } else {
      toast.error(res.error || "Failed to update product");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-4">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground text-sm">Update item details, pricing, and status</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tokyo Drift Oversized Tee"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">URL Slug (Optional)</label>
            <input
              type="text"
              placeholder="tokyo-drift-oversized-tee"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Base Price (₹)</label>
            <input
              type="number"
              required
              placeholder="999"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Original Price (MRP)</label>
            <input
              type="number"
              placeholder="1499"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Category</label>
            <select
              value={formData.categorySlug}
              onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-magenta"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Description</label>
          <textarea
            rows={4}
            placeholder="Write product description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-magenta"
          />
        </div>

        {/* Cloudinary Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Product Image *</label>
          {imageUrl ? (
            <div className="relative aspect-[3/4] w-full max-w-sm rounded-xl overflow-hidden border border-border">
              <Image src={imageUrl} alt="Preview" fill className="object-contain p-4" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 rounded-full"
                onClick={() => { setImageUrl(""); setPublicId(""); }}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-magenta transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="edit-product-image"
              />
              <label htmlFor="edit-product-image" className="cursor-pointer space-y-4 block">
                {uploading ? (
                  <Loader2 className="mx-auto h-12 w-12 text-magenta animate-spin" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <span className="text-sm font-bold block">
                    {uploading ? "Uploading design..." : "Click to upload product image"}
                  </span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNew"
              checked={formData.isNew}
              onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-magenta focus:ring-magenta"
            />
            <label htmlFor="isNew" className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
              Tag as New Arrival
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-magenta focus:ring-magenta"
            />
            <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
              Publish Status (Visible in store)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-border pt-6">
          <Button type="button" variant="outline" className="rounded-full font-bold uppercase" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-magenta text-white hover:bg-magenta/90 font-bold uppercase tracking-wider px-8"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Variants manager — rendered after slug is loaded */}
      {productSlug && (
        <VariantsManager productId={productId} productSlug={productSlug} />
      )}
    </div>
  );
}
