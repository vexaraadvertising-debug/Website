import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  Star, 
  Ticket, 
  Image as ImageIcon,
  BarChart3,
  Settings 
} from "lucide-react";

export const metadata: Metadata = {
  title: "ORINKO Admin Panel",
  description: "ORINKO Store Management",
};

import { getUserRole } from "@/lib/rbac";

import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("[ADMIN_LAYOUT_GUARD] Access denied: No authenticated user session found. Redirecting to /login");
    redirect("/login");
  }

  const role = await getUserRole(user, supabase);

  console.log(`[ADMIN_LAYOUT_GUARD] Access check for ${user.email} (ID: ${user.id}): Resolved role = "${role}"`);

  if (role !== "admin") {
    console.warn(`[ADMIN_LAYOUT_GUARD] Unauthorized access attempt by ${user.email} with role "${role}". Redirecting to /`);
    redirect("/");
  }


  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Product Analytics", href: "/admin/product-analytics", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Returns", href: "/admin/returns", icon: Package },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Homepage", href: "/admin/homepage", icon: LayoutDashboard }, // Changed icon or just reuse one, or import Monitor/Home
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-border flex flex-col items-start gap-3 h-28 shrink-0 justify-center">
          <div className="relative h-12 w-40 flex items-center overflow-hidden">
            <Image 
              src="/images/logo.png" 
              alt="ORINKO Logo" 
              fill
              className="object-contain object-left dark:invert"
              priority
            />
          </div>
          <span className="bg-magenta/10 text-magenta text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-magenta/20">
            ADMIN PANEL
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl text-sm font-bold transition-all"
              >
                <Icon className="h-4 w-4 shrink-0 text-magenta" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-magenta transition-colors uppercase tracking-widest text-center block w-full py-2">
            Return to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-secondary/10 h-full">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
