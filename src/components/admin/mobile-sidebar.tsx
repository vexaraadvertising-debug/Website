"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
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

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
    { label: "Homepage", href: "/admin/homepage", icon: LayoutDashboard },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <button className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground md:hidden flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-card border-r border-border">
        <SheetHeader className="p-6 border-b border-border flex flex-col items-start gap-3 h-28 shrink-0 justify-center text-left">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
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
        </SheetHeader>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-magenta/10 text-magenta" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-magenta" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link 
            href="/" 
            onClick={() => setOpen(false)}
            className="text-xs font-bold text-muted-foreground hover:text-magenta transition-colors uppercase tracking-widest text-center block w-full py-2"
          >
            Return to Store
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
