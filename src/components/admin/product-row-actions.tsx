"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/lib/admin-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/lib/toast-store";

export function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await deleteProductAction(productId);
    if (res.success) {
      toast.success("Product deleted successfully");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete product");
    }
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/products/edit/${productId}`}>
        <Button variant="outline" size="sm" className="h-8 rounded-lg uppercase text-[10px] font-bold">
          <Edit2 className="h-3 w-3 mr-1" /> Edit
        </Button>
      </Link>
      
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleDelete}
        className="h-8 rounded-lg text-destructive hover:bg-destructive/10 uppercase text-[10px] font-bold"
      >
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        )}
        Delete
      </Button>

      <ConfirmDeleteDialog 
        open={showConfirm} 
        onOpenChange={setShowConfirm}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete Product?"
        description="Are you sure you want to delete this product? This will permanently delete all associated images, size/color variants, inventory stock, and cart references!"
      />
    </div>
  );
}
