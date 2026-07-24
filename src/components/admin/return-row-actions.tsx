"use client";

import { useState } from "react";
import { Check, X, Loader2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveReturnAction, rejectReturnAction } from "@/lib/admin-returns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "@/lib/toast-store";

interface ReturnRowActionsProps {
  returnReq: any;
}

export function ReturnRowActions({ returnReq }: ReturnRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve this ${returnReq.type.toLowerCase()} request?`)) return;
    setLoading(true);
    const res = await approveReturnAction(returnReq.id);
    setLoading(false);
    if (!res.success) toast.success(res.error);
    else setViewOpen(false);
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject this request?`)) return;
    setLoading(true);
    const res = await rejectReturnAction(returnReq.id);
    setLoading(false);
    if (!res.success) toast.success(res.error);
    else setViewOpen(false);
  };

  return (
    <>
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTrigger 
          render={
            <Button variant="outline" size="sm" className="font-bold text-xs uppercase tracking-widest">
              <Eye className="h-4 w-4 mr-2" /> View Details
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase font-extrabold tracking-tight text-xl flex items-center justify-between">
              Return Request
              <span className={`text-xs px-3 py-1 rounded-full border ${
                returnReq.status === 'PENDING' ? 'bg-yellow/10 text-yellow border-yellow/20' : 
                returnReq.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' : 
                'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
                {returnReq.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-border pb-6">
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs mb-1">Customer</p>
                <p className="font-extrabold">{returnReq.user?.firstName} {returnReq.user?.lastName}</p>
                <p>{returnReq.user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs mb-1">Order</p>
                <a href={`/admin/orders/${returnReq.orderId}`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-magenta hover:underline flex items-center">
                  #{returnReq.order?.orderNumber} <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <p>Date: {new Date(returnReq.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-secondary/30 p-4 rounded-xl border border-border">
              <p className="text-muted-foreground font-bold uppercase text-xs mb-2">Item Details</p>
              <div className="flex gap-4">
                {returnReq.orderItem?.customImage && (
                  <div className="h-16 w-16 relative rounded-md border border-border bg-secondary shrink-0 overflow-hidden">
                    <Image src={returnReq.orderItem.customImage} alt="item" fill className="object-contain" />
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-sm">{returnReq.orderItem?.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {returnReq.orderItem?.quantity}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground font-bold uppercase text-xs mb-1">Request Type</p>
              <p className="font-extrabold">{returnReq.type}</p>
            </div>

            <div>
              <p className="text-muted-foreground font-bold uppercase text-xs mb-1">Reason</p>
              <p className="font-extrabold text-magenta">{returnReq.reason}</p>
            </div>

            {returnReq.description && (
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs mb-1">Description</p>
                <p className="text-sm bg-secondary p-3 rounded-md">{returnReq.description}</p>
              </div>
            )}

            {returnReq.images && returnReq.images.length > 0 && (
              <div>
                <p className="text-muted-foreground font-bold uppercase text-xs mb-2">Customer Uploads</p>
                <div className="flex flex-wrap gap-2">
                  {returnReq.images.map((img: string, i: number) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block relative h-20 w-20 border border-border rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {returnReq.status === "PENDING" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  disabled={loading} 
                  onClick={handleApprove}
                  className="flex-1 bg-success text-white hover:bg-success/90 font-bold uppercase tracking-widest text-xs"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Approve
                </Button>
                <Button 
                  disabled={loading} 
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1 font-bold uppercase tracking-widest text-xs"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
