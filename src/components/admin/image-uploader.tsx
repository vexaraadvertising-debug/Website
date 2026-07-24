"use client";

import { useState, useCallback } from "react";
import { UploadCloud, X, Star, GripVertical, Loader2 } from "lucide-react";
import { uploadProductImageAction, deleteProductImageAction } from "@/lib/actions";

export interface ImageUpload {
  id: string; // Temporary ID for UI
  secure_url: string;
  public_id: string;
  isPrimary: boolean;
  order: number;
}

interface ImageUploaderProps {
  images: ImageUpload[];
  onChange: (images: ImageUpload[]) => void;
  folder?: string;
}

export function ImageUploader({ images, onChange, folder = "orinko/products" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave" || e.type === "drop") setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const newImages = [...images];
      
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const result = await uploadProductImageAction(formData);
        
        if (result.success && result.secure_url && result.public_id) {
          newImages.push({
            id: result.public_id,
            secure_url: result.secure_url,
            public_id: result.public_id,
            isPrimary: newImages.length === 0,
            order: newImages.length,
          });
        } else {
          console.error("Failed to upload file:", file.name);
        }
      }
      onChange(newImages);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (public_id: string) => {
    try {
      const result = await deleteProductImageAction(public_id);
      if (result.success) {
        onChange(images.filter((img) => img.public_id !== public_id));
      } else {
        console.error("Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const setPrimary = (public_id: string) => {
    const updated = images.map(img => ({
      ...img,
      isPrimary: img.public_id === public_id
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-magenta bg-magenta/5' : 'border-border bg-background hover:bg-secondary/20'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files) handleUpload(Array.from(e.target.files));
          }}
          disabled={isUploading}
        />
        <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-bold text-foreground mb-1">
          {isUploading ? "Uploading..." : "Click or drag images to upload"}
        </p>
        <p className="text-xs text-muted-foreground font-medium">PNG, JPG, WEBP up to 5MB</p>
        {isUploading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-magenta" />}
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Uploaded Images</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={img.public_id} className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-magenta' : 'border-border'}`}>
                <img src={img.secure_url} alt="Product" className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPrimary(img.public_id); }}
                    className="p-2 bg-white rounded-full text-black hover:text-magenta transition-colors"
                    title="Set as Primary"
                  >
                    <Star className="h-4 w-4" fill={img.isPrimary ? "currentColor" : "none"} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(img.public_id); }}
                    className="p-2 bg-error rounded-full text-white hover:bg-error/90 transition-colors"
                    title="Delete Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-magenta text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
