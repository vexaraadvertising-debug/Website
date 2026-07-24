"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImageAction } from "@/lib/actions";
import { createAdminProduct } from "@/lib/admin-actions";
import { getCategories } from "@/lib/actions";
import { toast } from "@/lib/toast-store";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
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
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, categorySlug: res.data[0].slug }));
        }
      }
    }
    loadCategories();
  }, []);

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
    const res = await createAdminProduct({
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
      toast.error(res.error || "Failed to create product");
    }
    setLoading(false);
  };

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
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">Create Product</h1>
          <p className="text-muted-foreground text-sm">Add a new item to your store catalog</p>
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
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Product Image *</label>
            {imageUrl ? (
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-xl overflow-hidden border border-border">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => { setImageUrl(""); setPublicId(""); }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-[3/4] border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-magenta animate-spin mb-3" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  )}
                  <p className="text-sm font-bold text-foreground">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

        <div className="pt-4 border-t border-border flex justify-end gap-4">
          <Button type="button" variant="outline" className="rounded-full font-bold uppercase" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-magenta text-white hover:bg-magenta/90 font-bold uppercase tracking-widest text-xs px-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Product
          </Button>
        </div>
      </form>
    </div>
  );
}
