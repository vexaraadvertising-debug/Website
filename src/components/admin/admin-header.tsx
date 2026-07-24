"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchAdminAction } from "@/lib/admin-search";
import { getAdminNotificationsAction } from "@/lib/actions";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export function AdminHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const res = await getAdminNotificationsAction();
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
      setNotifCount(res.count || 0);
    }
  };

  useEffect(() => {
    loadNotifications();

    const supabase = createClient();
    
    // Subscribe to INSERT and UPDATE on AdminNotification
    const channel = supabase.channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "AdminNotification" },
        (payload) => {
          loadNotifications(); // Reload to get fresh data
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "AdminNotification" },
        (payload) => {
          loadNotifications(); // Reload to remove resolved ones
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchAdminAction(query);
      if (res.success) {
        setResults(res.data || []);
        setShowDropdown(true);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    setShowDropdown(false);
    setQuery("");
    
    // Using explicit browser history or native Link approach is better, but since it's a dynamic search result:
    if (item.type === "PRODUCT") router.push(`/admin/products/edit/${item.id}`);
    if (item.type === "ORDER") router.push(`/admin/orders/${item.id}`);
    if (item.type === "CUSTOMER") router.push(`/admin/customers`); // or specific page
  };

  const handleNotificationClick = (link: string) => {
    setShowNotifs(false);
    router.push(link);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
      <div className="flex items-center flex-1">
        <MobileSidebar />
        
        {/* Global Search */}
        <div className="relative w-full max-w-md ml-4 sm:ml-0" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products, orders, customers..." 
            className="w-full h-10 pl-10 pr-10 rounded-full border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-magenta focus:bg-background transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query) setShowDropdown(true); }}
          />
          {loading && <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-12 left-0 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[400px]">
            {results.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="overflow-y-auto p-2 space-y-1">
                {results.map((r, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-magenta/10 text-magenta rounded-md uppercase tracking-widest">
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative p-2 transition-colors rounded-full ${showNotifs ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-magenta text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-12 right-0 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col z-50">
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-bold text-sm uppercase tracking-widest">Notifications</h3>
                {notifCount > 0 && <span className="text-xs bg-magenta text-white px-2 py-0.5 rounded-full font-bold">{notifCount} Pending</span>}
              </div>
              <div className="overflow-y-auto max-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, index) => (
                      <button 
                        key={notif.id || index}
                        onClick={() => handleNotificationClick(notif.link)}
                        className="text-left p-4 border-b border-border hover:bg-secondary transition-colors relative"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm text-foreground pr-4 leading-tight">{notif.title}</p>
                          <div className="h-2 w-2 bg-magenta rounded-full shrink-0 mt-1"></div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
