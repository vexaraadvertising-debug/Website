"use client";

import { useState } from "react";
import { Star, MessageCircle, Trash2, Search, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAdminReview } from "@/lib/admin-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/lib/toast-store";

export function ReviewManager({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    const res = await deleteAdminReview(deleteTarget);
    if (res.success) {
      setReviews(reviews.filter(r => r.id !== deleteTarget));
    } else {
      toast.error("Failed to delete review");
    }
    setDeletingId(null);
    setDeleteTarget(null);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.user.email.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesRating = ratingFilter === "ALL" || r.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage customer reviews across all products</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by product, comment, email..."
            className="w-full pl-10 pr-4 h-12 bg-background border border-border rounded-xl focus:ring-2 focus:ring-magenta outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            className="h-12 bg-background border border-border rounded-xl px-4 outline-none focus:ring-2 focus:ring-magenta"
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-16 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-bold uppercase mb-2">No Reviews Found</h3>
            <p className="text-muted-foreground text-sm">No reviews match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-foreground uppercase">{r.product.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{r.productId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 text-magenta">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-4 w-4 ${star <= r.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-foreground mb-1">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.comment}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground capitalize">{r.user.firstName} {r.user.lastName}</div>
                      <div className="text-xs text-muted-foreground">{r.user.email}</div>
                      {r.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success/20 mt-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deletingId !== null}
        title="Delete Review?"
        description="Are you sure you want to delete this review? This action cannot be undone."
      />
    </div>
  );
}
