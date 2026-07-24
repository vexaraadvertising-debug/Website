"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Package, Download, MapPin, Truck, CheckCircle2, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderDetails } from "@/lib/actions";
import { ReturnRequestModal } from "@/components/storefront/return-request-modal";
import { CancelOrderModal } from "@/components/storefront/cancel-order-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      const res = await getOrderDetails(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setErrorMsg(res.error || "Unknown error");
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-4">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16 flex flex-col items-center justify-center text-center px-4">
        <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-extrabold uppercase tracking-tight mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          The order you are looking for does not exist or you do not have permission to view it.
          <br /><br />
          <span className="text-magenta font-mono text-xs block break-all">DEBUG: {errorMsg}</span>
        </p>
        <Link href="/orders">
          <Button className="rounded-xl bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase tracking-widest text-xs h-12 px-8 shadow-md transition-all active:scale-95">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Placed on {order.date}</p>
          </div>
          <Link href="/orders" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Details & Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border">
                      <Image 
                        src={item.customImage || "/images/hero_model.jpg"} 
                        alt={item.productName} 
                        fill 
                        className="object-contain p-1" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold uppercase text-sm">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground">Color: {item.color} | Size: {item.size}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      
                      {item.customImage && (
                        <div className="mt-2">
                          <a 
                            href={item.customImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold text-magenta hover:underline"
                          >
                            <ImageIcon className="h-3.5 w-3.5 mr-1" /> View Uploaded Design
                          </a>
                        </div>
                      )}

                      {order.status === "DELIVERED" && order.isWithinReturnWindow && !item.hasActiveReturn && (
                        <ReturnRequestModal 
                          orderId={order.id} 
                          orderItemId={item.id} 
                          productName={item.productName} 
                        />
                      )}
                      
                      {item.returns && item.returns.length > 0 && (
                        <p className="mt-2 text-xs font-bold text-magenta uppercase">
                          Return Status: {item.returns[0].status}
                        </p>
                      )}

                      {order.returnWindowExpired && !item.hasActiveReturn && (
                        <p className="mt-2 text-xs font-bold text-muted-foreground">
                          The 7-day return/replacement window for this order has expired.
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-base">₹{item.productPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Tracker */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><Truck className="h-5 w-5 text-magenta" /> Delivery Status</span>
                {["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status) && (
                  <CancelOrderModal orderId={order.id} />
                )}
              </h3>
              <div className="flex items-center justify-between text-xs font-bold text-magenta bg-magenta/10 p-4 rounded-xl border border-magenta/20">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Order Status: {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Summary & Address */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg uppercase tracking-tight">Summary</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {order.shippingFee === 0 ? (
                    <span className="text-success font-bold uppercase text-xs">Free</span>
                  ) : (
                    <span>₹{order.shippingFee}</span>
                  )}
                </div>
                <div className="flex justify-between font-extrabold text-xl text-foreground pt-3 border-t border-border">
                  <span>Total</span><span>₹{order.total}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground uppercase">Payment Method:</span>
                  <span className="text-foreground uppercase">{order.payment?.method || 'N/A'}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground uppercase">Payment Status:</span>
                  <span className={`uppercase ${order.payment?.status === 'SUCCESS' || order.payment?.status === 'PAID' ? 'text-success' : 'text-magenta'}`}>
                    {order.payment?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              <a href={`/api/invoices?orderId=${order.id}`} target="_blank" rel="noopener noreferrer" className="block pt-2">
                <Button className="w-full rounded-xl bg-magenta text-white font-bold uppercase text-xs">
                  <Download className="mr-2 h-4 w-4" /> Download PDF Invoice
                </Button>
              </a>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-2 text-sm">
              <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
                <MapPin className="h-4 w-4 text-magenta" /> Shipping Address
              </h3>
              {order.shippingAddress ? (
                <>
                  <p className="font-extrabold text-foreground pt-2">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>}
                  <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                  <p className="text-xs text-muted-foreground font-bold pt-1">Phone: {order.shippingAddress.phone}</p>
                </>
              ) : (
                <p className="text-muted-foreground pt-2">Shipping address not available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
