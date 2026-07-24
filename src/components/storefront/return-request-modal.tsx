"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { submitReturnRequestAction } from "@/lib/actions";
import { toast } from "@/lib/toast-store";

interface ReturnRequestModalProps {
  orderId: string;
  orderItemId: string;
  productName: string;
}

export function ReturnRequestModal({ orderId, orderItemId, productName }: ReturnRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"REFUND" | "REPLACEMENT">("REFUND");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const reasons = [
    "Wrong Product Received",
    "Damaged Product",
    "Size Issue",
    "Quality Issue",
    "Different Color Received",
    "Missing Item",
    "Other"
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (images.length >= 5) {
      toast.info("Maximum 5 images allowed.");
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder", "orinko/returns");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.secure_url) {
        setImages((prev) => [...prev, data.secure_url]);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return toast.info("Please select a reason");

    setLoading(true);
    const res = await submitReturnRequestAction({
      orderId,
      orderItemId,
      type,
      reason,
      description,
      images,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Return request submitted successfully. We will notify you once reviewed.");
      setOpen(false);
    } else {
      toast.error(res.error || "Failed to submit request.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-widest rounded-lg border-magenta text-magenta hover:bg-magenta/10">
            Request Return
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="uppercase font-extrabold tracking-tight">Request Return/Replacement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <p className="text-sm font-bold mb-1">Product: <span className="text-muted-foreground">{productName}</span></p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Request Type</label>
            <div className="flex gap-2">
              <Button type="button" variant={type === "REFUND" ? "default" : "outline"} onClick={() => setType("REFUND")} className="flex-1">Return & Refund</Button>
              <Button type="button" variant={type === "REPLACEMENT" ? "default" : "outline"} onClick={() => setType("REPLACEMENT")} className="flex-1">Replacement</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Reason</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="" disabled>Select a reason...</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Description (Optional)</label>
            <textarea 
              className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]"
              placeholder="Provide more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Images (Max 5)</label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-16 w-16 border border-border rounded-md overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/50 p-0.5 text-white rounded-bl-md">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-16 w-16 border border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 text-muted-foreground transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                  <span className="text-[10px] font-bold mt-1">Upload</span>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    disabled={uploading || images.length >= 5}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="bg-secondary/50 p-3 rounded-md text-xs text-muted-foreground">
            <p><strong>Note:</strong> By submitting, you confirm the pickup address is the same as the delivery address.</p>
          </div>

          <Button type="submit" disabled={loading || uploading || !reason} className="w-full font-bold uppercase tracking-widest bg-magenta text-white hover:bg-magenta/90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
