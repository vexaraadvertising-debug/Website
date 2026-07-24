"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, Package, MapPin, LogOut, Heart, Settings, Loader2 } from "lucide-react";
import { logout } from "../auth/actions";
import { Button } from "@/components/ui/button";
import { AddressManager } from "@/components/account/address-manager";
import { getUserProfileAction, updateUserProfileAction, getUserOrders } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/lib/toast-store";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders" | "wishlist" | "settings">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Settings form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getUserProfileAction();
        if (res.success && res.data) {
          setProfile(res.data);
          setFirstName(res.data.firstName || "");
          setLastName(res.data.lastName || "");
          setEmail(res.data.email || "");
        } else {
          toast.error("Failed to load user details.");
        }

        // Fetch avatar from Supabase auth session (Google avatar)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
        // Fetch orders for preview
        const ordersRes = await getUserOrders();
        if (ordersRes.success) {
          setOrders(ordersRes.data.slice(0, 5)); // Keep latest 5
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserProfileAction({ firstName, lastName });
      if (res.success) {
        toast.success("Profile details updated successfully!");
        setProfile(res.data);
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getInitials = () => {
    const first = firstName.charAt(0) || "U";
    const last = lastName.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  return (
    <div className="bg-background min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">My Account</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Manage your profile information, addresses, and orders.</p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="rounded-xl border-2 hover:bg-destructive hover:text-white font-bold uppercase text-xs h-10 px-4">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-magenta" />
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Loading account details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-1 bg-card border border-border p-3 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === "profile" ? "bg-magenta text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <UserIcon className="h-4 w-4" /> Profile Details
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === "orders" ? "bg-magenta text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" /> My Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === "addresses" ? "bg-magenta text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <MapPin className="h-4 w-4" /> Addresses
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === "wishlist" ? "bg-magenta text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Heart className="h-4 w-4" /> Wishlist
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  activeTab === "settings" ? "bg-magenta text-white shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
            </div>

            {/* Content Tabs */}
            <div className="md:col-span-3">
              {activeTab === "profile" && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    {avatarUrl ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-magenta/20">
                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-magenta/10 text-magenta flex items-center justify-center font-extrabold text-xl border-2 border-magenta/20">
                        {getInitials()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-2xl tracking-tight text-foreground">
                        {firstName ? `${firstName} ${lastName}` : "Member Profile"}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground">Manage and update your personal details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background font-semibold focus:ring-2 focus:ring-magenta outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background font-semibold focus:ring-2 focus:ring-magenta outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Email Address (Read-Only)</label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        placeholder="Email Address"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/50 font-semibold text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="rounded-xl bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase tracking-widest text-xs h-12 px-6 shadow-md transition-all active:scale-95"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <h3 className="font-extrabold text-xl uppercase tracking-tight">Order History</h3>
                    <Link href="/orders" className="text-xs font-bold text-magenta hover:underline tracking-widest uppercase">View Details</Link>
                  </div>
                  
                  {ordersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-magenta" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-40 text-magenta" />
                      <p className="font-bold text-foreground mb-1 text-base">No orders yet</p>
                      <p className="text-sm">Your completed or pending orders will appear here.</p>
                      <Link href="/shop" className="inline-block mt-5">
                        <Button size="sm" className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase text-xs h-10 px-5">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-magenta/50 transition-colors bg-secondary/20">
                          <div className="flex gap-4 items-center">
                            <div className="flex -space-x-4">
                              {order.thumbnails?.slice(0, 3).map((thumb: string, i: number) => (
                                <div key={i} className="h-12 w-12 rounded-lg border-2 border-background overflow-hidden relative bg-white shrink-0 shadow-sm z-10" style={{ zIndex: 3 - i }}>
                                  <Image src={thumb} alt="Product" fill className="object-cover" />
                                </div>
                              ))}
                              {order.itemsCount > 3 && (
                                <div className="h-12 w-12 rounded-lg border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold shrink-0 z-0 text-muted-foreground">
                                  +{order.itemsCount - 3}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">Order #{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.date} • {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                            <div className="text-right">
                              <p className="font-extrabold text-sm">₹{order.total.toFixed(2)}</p>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                order.status === 'DELIVERED' ? 'bg-success/10 text-success' : 
                                order.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' : 
                                'bg-magenta/10 text-magenta'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold uppercase">Details</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {orders.length >= 5 && (
                        <div className="text-center pt-4">
                          <Link href="/orders">
                            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-magenta hover:text-magenta/80">
                              View All Orders
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <AddressManager />
                </div>
              )}

              {activeTab === "wishlist" && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <h3 className="font-extrabold text-xl uppercase tracking-tight">My Wishlist</h3>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-40 text-magenta" />
                    <p className="font-bold text-foreground mb-1 text-base">Your wishlist is empty</p>
                    <p className="text-sm">Save items you love here to check them out later.</p>
                    <Link href="/shop" className="inline-block mt-5">
                      <Button size="sm" className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase text-xs h-10 px-5">
                        Explore Products
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="pb-4 border-b border-border">
                    <h3 className="font-extrabold text-xl uppercase tracking-tight">Account Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage passwords and login configuration</p>
                  </div>
                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password (min 8 characters)"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background font-semibold focus:ring-2 focus:ring-magenta outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background font-semibold focus:ring-2 focus:ring-magenta outline-none transition-all"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword}
                      className="rounded-xl bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase tracking-widest text-xs h-12 px-6 shadow-md transition-all active:scale-95 mt-2"
                    >
                      {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
