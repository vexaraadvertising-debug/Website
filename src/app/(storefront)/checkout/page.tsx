"use client";
import { Suspense } from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Lock, MapPin, CreditCard, ShoppingBag, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Script from "next/script";
import { getAddresses, validateCouponAction, getCodSettingAction, createCodOrderAction, createRazorpayOrderAction, verifyPaymentAndCreateOrderAction } from "@/lib/actions";
import { toast } from "@/lib/toast-store";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";
  const { items, buyNowItem, getTotals, clearCart, setBuyNowItem } = useCartStore();
  const displayItems = (isBuyNow && buyNowItem) ? [buyNowItem] : items;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [codEnabled, setCodEnabled] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  
  const rawTotals = getTotals(isBuyNow);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totals = {
    ...rawTotals,
    total: Math.max(0, rawTotals.total - discount)
  };

  // Load addresses and settings on mount
  useEffect(() => {
    getAddresses().then(res => {
      if (res.success && res.data.length > 0) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    });
    getCodSettingAction().then(res => {
      if (res.success) {
        setCodEnabled(res.enabled);
      }
    });
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError("");
    
    const res = await validateCouponAction(couponCode, rawTotals.subtotal);
    if (res.success) {
      setAppliedCoupon({ id: res.couponId, code: res.code, discountAmount: res.discountAmount });
    } else {
      setCouponError(res.error || "Invalid coupon.");
    }
    setCouponLoading(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) return toast.info("Please select an address");
    
    setLoading(true);
    const orderItems = displayItems.map(item => ({
      variantId: item.variantId || "",
      productName: item.name,
      productPrice: item.price,
      quantity: item.quantity,
      customImage: item.customImage || null
    }));

    if (paymentMethod === "COD") {
      const res = await createCodOrderAction({
        shippingAddressId: selectedAddressId,
        subtotal: rawTotals.subtotal,
        tax: 0,
        shippingFee: 0,
        total: totals.total,
        paymentMethod: "COD",
        items: orderItems,
      });

      if (res.success) {
        if (isBuyNow) {
          setBuyNowItem(null);
        } else {
          clearCart();
        }
        router.push("/checkout/success");
      } else {
        toast.error("Error: " + res.error);
        setLoading(false);
      }
    } else {
      // Razorpay Flow
      const rpRes = await createRazorpayOrderAction(totals.total);
      if (!rpRes.success) {
        toast.error("Failed to initialize payment: " + rpRes.error);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        amount: rpRes.amount,
        currency: "INR",
        name: "Orinko",
        description: "Order Payment",
        order_id: rpRes.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyPaymentAndCreateOrderAction({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            shippingAddressId: selectedAddressId,
            subtotal: rawTotals.subtotal,
            tax: 0,
            shippingFee: 0,
            total: totals.total,
            paymentMethod,
            items: orderItems,
          });

          if (verifyRes.success) {
            if (isBuyNow) {
              setBuyNowItem(null);
            } else {
              clearCart();
            }
            router.push("/checkout/success");
          } else {
            toast.error("Payment verification failed: " + verifyRes.error);
            setLoading(false);
          }
        },
        theme: {
          color: "#FF2D96"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any){
        toast.error("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
    }
  };

  if (displayItems.length === 0 && step === 1) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-neutral-400" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Your cart is empty</h1>
        <Link href="/collections">
          <Button size="lg" className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white uppercase tracking-widest font-bold px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">Checkout</h1>
          <div className="flex items-center text-sm font-bold text-muted-foreground gap-4">
            <span className={step >= 1 ? "text-foreground" : ""}>1. Address</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step >= 2 ? "text-foreground" : ""}>2. Shipping</span>
            <ChevronRight className="h-4 w-4" />
            <span className={step >= 3 ? "text-foreground" : ""}>3. Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Address */}
            <div className={`border border-border rounded-2xl p-6 ${step === 1 ? 'bg-card shadow-sm ring-1 ring-border' : 'bg-secondary/30'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold flex items-center gap-2 uppercase tracking-wide">
                  <MapPin className="h-5 w-5 text-magenta" /> Shipping Address
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-sm font-bold underline text-muted-foreground hover:text-foreground">Edit</button>
                )}
              </div>
              
              {step === 1 ? (
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="p-4 bg-secondary/50 rounded-xl text-center">
                      <p className="text-sm font-bold">No saved addresses found.</p>
                      <Link href="/account" className="text-magenta hover:underline text-xs mt-2 block">
                        Add an address in your account settings first.
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`p-4 border rounded-xl cursor-pointer ${selectedAddressId === addr.id ? 'border-magenta bg-magenta/5 ring-1 ring-magenta' : 'border-border bg-background'}`}>
                          <input type="radio" name="address" className="hidden" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                          <h4 className="font-bold text-foreground capitalize mb-1">{addr.firstName} {addr.lastName}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {addr.street}<br/>
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-sm font-bold mt-2">
                            {addr.phone ? `Phone: ${addr.phone}` : <span className="text-destructive text-xs uppercase tracking-widest">Phone Required</span>}
                          </p>
                        </label>
                      ))}
                    </div>
                  )}
                  <Button 
                    onClick={() => {
                      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                      if (!selectedAddr?.phone) {
                        toast.info("Please update your address to include a phone number before continuing.");
                        return;
                      }
                      setStep(2);
                    }} 
                    disabled={!selectedAddressId} 
                    size="lg" 
                    className="w-full mt-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest"
                  >
                    Continue to Shipping
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {addresses.find(a => a.id === selectedAddressId) ? (
                    <>
                      <p className="font-bold text-foreground">{addresses.find(a => a.id === selectedAddressId).firstName} {addresses.find(a => a.id === selectedAddressId).lastName}</p>
                      <p>{addresses.find(a => a.id === selectedAddressId).street}, {addresses.find(a => a.id === selectedAddressId).city}</p>
                      <p>{addresses.find(a => a.id === selectedAddressId).postalCode}</p>
                      <p className="font-bold mt-1 text-foreground">Phone: {addresses.find(a => a.id === selectedAddressId).phone}</p>
                    </>
                  ) : <p>No Address Selected</p>}
                </div>
              )}
            </div>

            {/* Step 2: Shipping Method */}
            <div className={`border border-border rounded-2xl p-6 ${step === 2 ? 'bg-card shadow-sm ring-1 ring-border' : 'bg-secondary/30 opacity-60'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold flex items-center gap-2 uppercase tracking-wide">
                  <Truck className="h-5 w-5 text-magenta" /> Shipping Method
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-sm font-bold underline text-muted-foreground hover:text-foreground">Edit</button>
                )}
              </div>
              
              {step === 2 && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                  <label className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:border-magenta transition-colors bg-background ring-1 ring-magenta/20">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-4 border-magenta bg-white flex items-center justify-center shrink-0" />
                      <div>
                        <p className="font-bold">Standard Shipping</p>
                        <p className="text-xs text-muted-foreground">3-5 Business Days</p>
                      </div>
                    </div>
                    <span className="font-bold text-success">FREE</span>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:border-magenta transition-colors bg-background">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border border-border bg-white flex items-center justify-center shrink-0" />
                      <div>
                        <p className="font-bold">Express Shipping</p>
                        <p className="text-xs text-muted-foreground">1-2 Business Days</p>
                      </div>
                    </div>
                    <span className="font-bold">₹150</span>
                  </label>
                  
                  <Button type="submit" size="lg" className="w-full mt-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest">
                    Continue to Payment
                  </Button>
                </form>
              )}
              {step > 2 && (
                <div className="text-sm">
                  <span className="font-bold">Standard Shipping</span> (Free) - 3-5 Business Days
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`border border-border rounded-2xl p-6 ${step === 3 ? 'bg-card shadow-sm ring-1 ring-border' : 'bg-secondary/30 opacity-60'}`}>
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-extrabold flex items-center gap-2 uppercase tracking-wide">
                  <CreditCard className="h-5 w-5 text-magenta" /> Payment Method
                </h2>
              </div>
              
              {step === 3 && (
                <form className="space-y-6" onSubmit={handlePlaceOrder}>
                  <div className="space-y-4">
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-magenta bg-magenta/5 ring-1 ring-magenta/20' : 'border-border bg-background hover:border-magenta/50'}`}>
                      <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                      <div className={`h-5 w-5 rounded-full border shrink-0 ${paymentMethod === 'CARD' ? 'border-4 border-magenta bg-white' : 'border-border bg-white'}`} />
                      <span className="font-bold">Credit / Debit Card (Razorpay)</span>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-magenta bg-magenta/5 ring-1 ring-magenta/20' : 'border-border bg-background hover:border-magenta/50'}`}>
                      <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                      <div className={`h-5 w-5 rounded-full border shrink-0 ${paymentMethod === 'UPI' ? 'border-4 border-magenta bg-white' : 'border-border bg-white'}`} />
                      <span className="font-bold">UPI / Net Banking (Razorpay)</span>
                    </label>
                    {codEnabled ? (
                      <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-magenta bg-magenta/5 ring-1 ring-magenta/20' : 'border-border bg-background hover:border-magenta/50'}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                        <div className={`h-5 w-5 rounded-full border shrink-0 ${paymentMethod === 'COD' ? 'border-4 border-magenta bg-white' : 'border-border bg-white'}`} />
                        <span className="font-bold">Cash on Delivery (COD)</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-secondary/30 text-muted-foreground select-none">
                        <div className="h-5 w-5 rounded-full border border-border bg-neutral-200 shrink-0" />
                        <span className="font-bold text-xs uppercase tracking-widest">Cash on Delivery Coming Soon</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-3 text-sm text-muted-foreground">
                    <Lock className="h-5 w-5 shrink-0" />
                    <p>Your payment information is processed securely. We do not store credit card details.</p>
                  </div>

                  <Button disabled={loading} type="submit" size="lg" className="w-full h-16 rounded-xl bg-magenta hover:bg-magenta/90 text-white font-extrabold text-lg uppercase tracking-widest shadow-[0_10px_40px_rgba(255,45,150,0.3)]">
                    {loading ? "Processing..." : `Pay ₹${totals.total} & Place Order`}
                  </Button>
                </form>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-2xl p-6 sticky top-24 bg-card shadow-sm">
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm py-1">
                      <h3 className="font-bold leading-tight line-clamp-2 mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item.color} / {item.size}</p>
                      <p className="font-extrabold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Shipping</span>
                  <span className="text-success uppercase tracking-widest text-xs self-center">Free</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between font-extrabold text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-border pt-4 mt-4 flex justify-between font-extrabold text-xl">
                  <span>Total</span>
                  <span className="text-magenta">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section */}
              {step === 3 && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-extrabold text-lg mb-4">Have a coupon code?</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="font-bold text-success uppercase">{appliedCoupon.code} Applied</span>
                      </div>
                      <button onClick={() => setAppliedCoupon(null)} className="text-xs font-bold text-muted-foreground hover:text-destructive uppercase">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={couponCode} 
                          onChange={e => setCouponCode(e.target.value)} 
                          placeholder="ENTER CODE" 
                          className="flex-1 h-12 px-4 rounded-xl border border-border bg-background uppercase font-bold outline-none focus:ring-2 focus:ring-magenta"
                        />
                        <Button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} className="h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold uppercase px-6">
                          {couponLoading ? "..." : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive font-bold">{couponError}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 pb-20 max-w-7xl mx-auto"><div className="animate-pulse bg-secondary/50 rounded-2xl h-64 w-full"></div></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
