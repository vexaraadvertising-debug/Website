"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { uploadProductImageAction, uploadBannerImageAction, deleteProductImageAction } from "@/lib/actions";
import { toast } from "@/lib/toast-store";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState<{url: string, publicId?: string}[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "product" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    const res = type === "product" 
      ? await uploadProductImageAction(data)
      : await uploadBannerImageAction(data);

    if (res.success && res.secure_url) {
      setMediaList([{ url: res.secure_url, publicId: res.public_id }, ...mediaList]);
      toast.success("Image uploaded!");
    } else {
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage Cloudinary product images and promotional banners</p>
        </div>

        <div className="flex gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 bg-magenta text-white hover:bg-magenta/90 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Product Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "product")} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mediaList.map((item, idx) => (
          <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
            <Image src={item.url} alt={`Media asset ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-[10px] font-mono text-white break-all flex-col gap-2">
              <span>{item.url.split('/').pop()}</span>
              <button 
                onClick={async () => {
                  if (item.publicId) {
                    setUploading(true);
                    const res = await deleteProductImageAction(item.publicId);
                    setUploading(false);
                    if (!res.success) {
                      toast.error("Failed to delete from Cloudinary");
                      return;
                    }
                  }
                  setMediaList(mediaList.filter((_, i) => i !== idx));
                  toast.success("Media deleted");
                }}
                className="h-8 w-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                title="Delete Image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
