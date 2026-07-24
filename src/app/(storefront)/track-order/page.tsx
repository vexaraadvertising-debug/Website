"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, ChevronRight, Search, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      // Generate some realistic-looking data based on the ID
      setTrackingData({
        id: orderId,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: "shipped", // pending, processing, shipped, delivered
        courier: "Delhivery",
        awb: "DLV" + Math.floor(100000000 + Math.random() * 900000000),
        items: [
          { name: "Anime Oversized T-Shirt - Black, L", qty: 1 }
        ],
        events: [
          { 
            status: "Order Placed", 
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
            time: "10:23 AM", 
            location: "Website",
            description: "Your order has been placed successfully.",
            completed: true
          },
          { 
            status: "Packed", 
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
            time: "02:15 PM", 
            location: "ORINKO Warehouse, Mumbai",
            description: "Seller has processed your order and packed your items.",
            completed: true
          },
          { 
            status: "Shipped", 
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
            time: "09:40 AM", 
            location: "Mumbai Logistics Center",
            description: "Your item has been picked up by courier partner.",
            completed: true
          },
          { 
            status: "In Transit", 
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
            time: "06:20 PM", 
            location: "Regional Hub",
            description: "Your item is in transit to the destination hub.",
            completed: true
          },
          { 
            status: "Out for Delivery", 
            date: "", 
            time: "", 
            location: "",
            description: "Your item is out for delivery.",
            completed: false
          },
          { 
            status: "Delivered", 
            date: "", 
            time: "", 
            location: "",
            description: "Your item has been delivered.",
            completed: false
          }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Track Order</span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-magenta to-black" />
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Enter your order ID or tracking number to get real-time updates on your shipment status.
          </p>
          
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-123456)"
                className="pl-12 h-14 rounded-2xl bg-secondary/50 border-border focus-visible:ring-magenta font-bold uppercase"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !orderId.trim()}
              className="h-14 px-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-extrabold uppercase tracking-widest transition-all"
            >
              {loading ? "Locating..." : "Track"}
            </Button>
          </form>
        </div>

        {trackingData && (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-secondary/30 p-6 md:p-8 border-b border-border flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                <p className="text-2xl font-extrabold">{trackingData.id}</p>
                <div className="flex items-center gap-4 mt-4 text-sm font-medium">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Ordered: {trackingData.date}
                  </div>
                  <div className="flex items-center gap-1 text-magenta">
                    <Truck className="h-4 w-4" /> Expected: {trackingData.expectedDelivery}
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Courier Partner</p>
                <p className="font-extrabold">{trackingData.courier}</p>
                <p className="text-sm text-muted-foreground mt-1">AWB: {trackingData.awb}</p>
              </div>
            </div>

            {/* Tracking Timeline (Flipkart Style) */}
            <div className="p-6 md:p-10">
              <h3 className="font-extrabold uppercase tracking-widest text-sm border-b border-border pb-2 mb-8">
                Tracking History
              </h3>
              
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {trackingData.events.map((event: any, index: number) => {
                  const isLastCompleted = event.completed && (!trackingData.events[index + 1]?.completed);
                  
                  return (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8 last:mb-0">
                      
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${
                        event.completed 
                          ? isLastCompleted 
                            ? 'bg-magenta border-magenta/20 text-white shadow-[0_0_15px_rgba(255,45,150,0.5)]'
                            : 'bg-success border-success/20 text-white' 
                          : 'bg-secondary border-border text-muted-foreground'
                      }`}>
                        {event.status === "Order Placed" && <Package className="h-4 w-4" />}
                        {event.status === "Packed" && <Package className="h-4 w-4" />}
                        {event.status === "Shipped" && <Truck className="h-4 w-4" />}
                        {event.status === "In Transit" && <Truck className="h-4 w-4" />}
                        {event.status === "Out for Delivery" && <Truck className="h-4 w-4" />}
                        {event.status === "Delivered" && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      
                      {/* Content */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl border border-border bg-background shadow-sm hover:border-magenta/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                          <h4 className={`font-bold ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {event.status}
                          </h4>
                          {event.completed && (
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              {event.date} • {event.time}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {event.description}
                        </p>
                        {event.location && event.completed && (
                          <div className="flex items-center gap-1 mt-3 text-xs font-bold text-magenta uppercase tracking-wider">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
