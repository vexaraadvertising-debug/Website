"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cancelOrderAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast-store";

interface CancelOrderModalProps {
  orderId: string;
}

export function CancelOrderModal({ orderId }: CancelOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;

    setLoading(true);
    const res = await cancelOrderAction(orderId, reason);
    setLoading(false);

    if (res.success) {
      toast.success("Order cancelled successfully.");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to cancel order.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="destructive" size="sm" className="h-10 px-6 font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
            Cancel Order
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="uppercase font-extrabold tracking-tight text-destructive">Cancel Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this order? Please provide a reason below (optional).
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Reason</label>
            <textarea 
              className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]"
              placeholder="Why are you cancelling?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            variant="destructive" 
            className="w-full font-bold uppercase tracking-widest text-xs h-10"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirm Cancellation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
