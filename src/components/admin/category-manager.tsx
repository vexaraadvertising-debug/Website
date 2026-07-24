"use client";

import { useState } from "react";
import { FolderTree, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/admin-actions";
import { uploadProductImageAction, deleteProductImageAction } from "@/lib/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast-store";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export function CategoryManager({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, pubId: string } | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setPublicId("");
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (c: any) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description);
    setImageUrl(c.imageUrl);
    setPublicId(c.publicId);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "orinko/categories");

    const res = await uploadProductImageAction(formData);
    if (res.success) {
      // If we are replacing an existing image, delete the old one
      if (imageUrl && publicId) {
        await deleteProductImageAction(publicId);
      }
      setImageUrl(res.secure_url || "");
      setPublicId(res.public_id || "");
    } else {
      toast.error("Failed to upload image: " + res.error);
    }
    setUploading(false);
  };

  const handleRemoveImage = async () => {
    if (!publicId) return;
    setUploading(true);
    const res = await deleteProductImageAction(publicId);
    if (res.success) {
      setImageUrl("");
      setPublicId("");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let res;
    if (editingCategory) {
      res = await updateCategoryAction(editingCategory.id, { name, description, imageUrl, publicId });
    } else {
      res = await createCategoryAction({ name, description, imageUrl, publicId });
    }

    if (res.success) {
      resetForm();
      // the page will automatically revalidate
    } else {
      toast.error("Error: " + res.error);
    }
    setSubmitting(false);
  };

  const handleDelete = (id: string, pubId: string) => {
    setDeleteTarget({ id, pubId });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    
    if (deleteTarget.pubId) {
      await deleteProductImageAction(deleteTarget.pubId);
    }
    const res = await deleteCategoryAction(deleteTarget.id);
    
    if (res.success) {
      toast.success("Category deleted");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete category");
    }
    setSubmitting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Organize your store collections</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="rounded-xl bg-magenta text-white hover:bg-magenta/90 font-bold uppercase h-12 px-6">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-xl font-extrabold uppercase">{editingCategory ? "Edit Category" : "New Category"}</h2>
            <Button type="button" variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Category Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background" placeholder="e.g. Graphic Tees" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 rounded-xl border border-border bg-background min-h-[100px]" placeholder="Category description..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest">Category Image</label>
              {imageUrl ? (
                <div className="relative border border-border rounded-xl overflow-hidden aspect-video bg-secondary/30 flex items-center justify-center">
                  <Image src={imageUrl} alt="Category" fill className="object-cover" />
                  <Button type="button" onClick={handleRemoveImage} disabled={uploading} variant="destructive" size="sm" className="absolute top-2 right-2 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl aspect-video flex flex-col items-center justify-center gap-3 bg-secondary/10">
                  <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-bold text-magenta hover:underline">{uploading ? "Uploading..." : "Click to Upload"}</span>
                    <input type="file" className="hidden" accept="image/*" disabled={uploading} onChange={handleImageUpload} />
                  </label>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>
          
          <Button disabled={submitting || uploading} type="submit" size="lg" className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase px-8">
            {submitting ? "Saving..." : "Save Category"}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCategories.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group overflow-hidden relative">
            {c.imageUrl && (
              <div className="absolute inset-0 z-0 opacity-20">
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
              </div>
            )}
            <div className="relative z-10">
              <div className="h-10 w-10 rounded-full bg-magenta/10 text-magenta flex items-center justify-center mb-4">
                <FolderTree className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-xl uppercase mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">slug: {c.slug}</p>
            </div>
            
            <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground mt-4">
              <span>{c.productCount} Products</span>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(c)} variant="outline" size="sm" className="h-8 rounded-lg uppercase text-[10px]">Edit</Button>
                <Button onClick={() => handleDelete(c.id, c.publicId)} variant="ghost" size="sm" className="h-8 rounded-lg text-destructive hover:bg-destructive/10 uppercase text-[10px]"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={submitting}
        title="Delete Category?"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
}
