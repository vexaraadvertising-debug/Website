"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, CreditCard, Calendar, Download, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminOrderDetail, updateOrderStatus } from "@/lib/admin-actions";
import { OrderStatusSelect } from "../order-status-select";
import { toast } from "@/lib/toast-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const res = await getAdminOrderDetail(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error(res.error || "Order not found");
        router.push("/admin/orders");
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId, router]);

  const getDownloadUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("cloudinary.com")) {
      // Force attachment, format as JPG, 100% quality
      let newUrl = url.replace("/upload/", "/upload/fl_attachment,f_jpg,q_100/");
      // Force the extension in the URL to be .jpg so the browser saves it as .jpg
      newUrl = newUrl.replace(/\.[^/.]+$/, ".jpg");
      return newUrl;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-4">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Manage order fulfillment, logistics, and print designs</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-2xl">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest px-2">Fulfillment:</span>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Products Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-lg uppercase tracking-tight mb-6">Ordered Products</h3>
            
            <div className="divide-y divide-border font-medium">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 justify-between">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0">
                      <Image 
                        src={item.customImage || "/images/hero_model.jpg"} 
                        alt={item.productName} 
                        fill 
                        className="object-contain p-1" 
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold uppercase text-sm">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Color: {item.color} | Size: {item.size}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                      
                      {item.customImage && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a 
                            href={item.customImage} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-xs font-bold bg-magenta/10 hover:bg-magenta/20 text-magenta border border-magenta/20 px-3 py-1.5 rounded-xl"
                          >
                            <ExternalLink className="h-3 w-3 mr-1.5" /> View Design
                          </a>
                          
                          {/* Cloudinary download helper link */}
                          <a 
                            href={getDownloadUrl(item.customImage)} 
                            download="custom-design.jpg" 
                            className="inline-flex items-center text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border px-3 py-1.5 rounded-xl"
                          >
                            <Download className="h-3 w-3 mr-1.5" /> Download File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-base">₹{item.productPrice * item.quantity}</div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">₹{item.productPrice} x {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Custom Printing Preview Panel (renders if any item is customized) */}
          {order.items.some((item: any) => item.customImage) && (
            <div className="bg-card border border-magenta/20 rounded-2xl p-6 shadow-sm bg-magenta/[0.01]">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4 text-magenta flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Print Customization Details
              </h3>
              <p className="text-xs text-muted-foreground font-medium mb-6">
                Below are the custom graphic design assets uploaded by the customer for high-resolution garment printing.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.filter((item: any) => item.customImage).map((item: any) => (
                  <div key={item.id} className="border border-border bg-background p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase text-foreground">{item.productName}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Size: {item.size} • Color: {item.color}</p>
                    </div>
                    
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-secondary/35 border">
                      <Image src={item.customImage} alt="Custom printing design preview" fill className="object-contain p-2" />
                    </div>

                    <a 
                      href={getDownloadUrl(item.customImage)} 
                      download="custom-design.jpg" 
                      className="block"
                    >
                      <Button className="w-full h-10 rounded-xl bg-magenta text-white font-bold text-xs uppercase">
                        <Download className="mr-2 h-3.5 w-3.5" /> Download Design File
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar details: Customers, Shipping, and Payment */}
        <div className="space-y-6">
          
          {/* Customer Metadata Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg uppercase tracking-tight">Customer Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="font-bold text-foreground text-base">{order.customerName}</div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{order.customerEmail}</span>
              </div>
              
              {order.shippingAddress.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-magenta" /> Shipping Address
            </h3>
            
            <div className="text-sm space-y-1 text-muted-foreground font-medium">
              <p className="font-bold text-foreground mb-2">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg uppercase tracking-tight">Financial Summary</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{order.shippingFee}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{order.tax}</span></div>
              
              <div className="flex justify-between font-extrabold text-xl text-foreground pt-3 border-t border-border">
                <span>Total</span><span>₹{order.total}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-muted-foreground uppercase">Payment Method:</span>
                <span className="text-foreground uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-muted-foreground uppercase">Payment Status:</span>
                <span className={`uppercase ${order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'PAID' ? 'text-success' : 'text-magenta'}`}>{order.paymentStatus}</span>
              </div>
              {order.razorpayOrderId && (
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground uppercase">RP Order ID:</span>
                  <span className="text-foreground text-right">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="flex justify-between font-bold mt-1">
                  <span className="text-muted-foreground uppercase">RP Payment ID:</span>
                  <span className="text-foreground text-right">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
