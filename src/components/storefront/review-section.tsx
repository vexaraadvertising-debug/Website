"use client";

import { useState, useEffect } from "react";
import { Star, MessageCircle, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addReviewAction } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/lib/toast-store";

export function ReviewSection({ productId, initialReviews }: { productId: string, initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.info("Please log in to write a review.");
    if (!title || !comment) return toast.error("Title and comment are required.");

    setSubmitting(true);
    const res = await addReviewAction(productId, { rating, title, comment });
    
    if (res.success) {
      toast.success("Review submitted successfully!");
      setShowForm(false);
      setTitle("");
      setComment("");
      setRating(5);
      // In a real app we'd fetch the new review or optimistically update
      window.location.reload(); 
    } else {
      toast.error(res.error || "Failed to submit review.");
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-16 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex gap-1 text-magenta">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-5 w-5 ${star <= parseFloat(avgRating) ? 'fill-current' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <span className="font-bold text-lg">{avgRating} out of 5</span>
            <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
          </div>
        </div>
        
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-magenta text-white hover:bg-magenta/90 font-bold uppercase h-12 px-8">
          <MessageCircle className="mr-2 h-4 w-4" /> Write a Review
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-secondary/20 border border-border rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-extrabold uppercase">Write your review</h3>
          
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`h-8 w-8 transition-colors ${star <= rating ? 'fill-magenta text-magenta' : 'text-muted-foreground hover:text-magenta/50'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Review Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-magenta outline-none" placeholder="Sum up your experience" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Review Comment *</label>
            <textarea required value={comment} onChange={e => setComment(e.target.value)} className="w-full p-4 min-h-[120px] rounded-xl border border-border bg-background focus:ring-2 focus:ring-magenta outline-none" placeholder="What did you like or dislike?" />
          </div>

          <Button disabled={submitting} type="submit" size="lg" className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase px-8">
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">No reviews yet.</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-1 text-magenta mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <h4 className="font-extrabold text-lg">{review.title}</h4>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
              
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="uppercase">{review.user?.firstName} {review.user?.lastName}</span>
                  {review.isVerifiedBuyer && (
                    <span className="text-success flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full border border-success/20">
                      <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
