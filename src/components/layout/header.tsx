"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Heart, User, Menu, X } from "lucide-react";
import { SideCart } from "@/components/cart/side-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useCartStore } from "@/lib/store";
import { searchStorefrontAction, getCategories } from "@/lib/actions";
import { Loader2, ChevronDown } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Custom Printing", href: "/custom-printing" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wishlistItems = useCartStore((state) => state.wishlist);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    async function loadCategories() {
      const res = await getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }
    loadCategories();
  }, []);

  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchStorefrontAction(searchQuery.trim());
      if (res.success) {
        setSearchResults(res.data);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click outside to close search
  const searchRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);


  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-background/95 backdrop-blur-md border-b shadow-sm text-foreground"
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Mobile Menu */}
          <div className="flex flex-1 items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                }
              />
              <SheetContent side="left" className="w-[85vw] max-w-[320px] sm:w-[350px] p-0 flex flex-col h-full bg-background border-r border-border">
                <SheetHeader className="p-4 md:p-6 border-b border-border/50 shrink-0">
                  <SheetTitle className="text-left">
                    <Link href="/" className="inline-block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Image
                        src="/images/logo.png"
                        alt="ORINKO"
                        width={150}
                        height={50}
                        className="h-8 md:h-10 w-auto object-contain"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto scrollbar-none p-4 md:p-6">
                  <nav className="flex flex-col space-y-2">
                    <Link 
                      href="/" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full min-h-[44px] px-3 md:px-4 py-2 text-base md:text-lg font-semibold hover:bg-secondary rounded-xl hover:text-magenta transition-colors"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/shop" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full min-h-[44px] px-3 md:px-4 py-2 text-base md:text-lg font-semibold hover:bg-secondary rounded-xl hover:text-magenta transition-colors"
                    >
                      Shop
                    </Link>
                    
                    <div className="flex flex-col rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                        className="flex items-center justify-between w-full min-h-[44px] px-3 md:px-4 py-2 text-base md:text-lg font-semibold hover:bg-secondary transition-colors"
                      >
                        Categories
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${mobileCategoriesOpen ? "rotate-180 text-magenta" : ""}`} />
                      </button>
                      
                      <motion.div 
                        initial={false}
                        animate={{ height: mobileCategoriesOpen ? 'auto' : 0, opacity: mobileCategoriesOpen ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 px-4 md:px-6 py-2 pb-4 bg-secondary/30">
                          {categories.map((cat) => (
                            <Link 
                              key={cat.id} 
                              href={`/category/${cat.slug}`} 
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center min-h-[44px] text-sm md:text-base font-medium text-muted-foreground hover:text-magenta transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    <Link 
                      href="/custom-printing" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full min-h-[44px] px-3 md:px-4 py-2 text-base md:text-lg font-semibold hover:bg-secondary rounded-xl hover:text-magenta transition-colors"
                    >
                      Custom Printing
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex justify-center flex-none md:flex-1 md:justify-start">
            <Link href="/" className="flex items-center group">
              <div className="relative h-8 w-32 md:h-12 md:w-44 flex items-center overflow-hidden">
                <Image 
                  src="/images/logo.png" 
                  alt="ORINKO Logo" 
                  fill
                  className="object-contain object-center md:object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-wide hover:text-magenta transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-semibold tracking-wide hover:text-magenta transition-colors">Shop</Link>
            
            <div 
              className="relative group py-2"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-semibold tracking-wide hover:text-magenta transition-colors outline-none">
                Categories <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 w-48 ${dropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`}
              >
                <div className="bg-background border border-border rounded-xl shadow-xl p-2 flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-magenta to-purple-500" />
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/category/${cat.slug}`} 
                      className="px-4 py-2 text-sm font-semibold hover:bg-secondary rounded-lg transition-colors hover:text-magenta"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/custom-printing" className="text-sm font-semibold tracking-wide hover:text-magenta transition-colors">Custom Printing</Link>
          </nav>

          {/* Actions */}
          <div className="flex flex-1 items-center justify-end gap-0 md:gap-2">
            <MagneticButton>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 md:h-10 md:w-10" onClick={() => { setSearchOpen(true); setTimeout(() => document.getElementById("searchInput")?.focus(), 100); }}>
                <Search className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </MagneticButton>
            
            <MagneticButton>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="rounded-full relative inline-flex h-9 w-9 md:h-10 md:w-10">
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                  {isMounted && wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-magenta text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Button>
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link href="/account">
                <Button variant="ghost" size="icon" className="rounded-full inline-flex h-9 w-9 md:h-10 md:w-10">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
            </MagneticButton>

            <SideCart />
          </div>
        </div>

        {/* Expandable Search Bar */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: searchOpen ? 'auto' : 0, opacity: searchOpen ? 1 : 0 }}
          className="overflow-hidden bg-background border-t border-border absolute top-full left-0 right-0 w-full shadow-lg"
        >
          <div className="container mx-auto px-4 md:px-6 py-4" ref={searchRef}>
            <div className="relative flex items-center max-w-2xl mx-auto">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <input
                id="searchInput"
                type="text"
                placeholder="Search anime, oversized, minimal t-shirts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-full border border-border bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-magenta outline-none font-medium transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false);
                    window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                  }
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Live Search Results */}
            {searchOpen && (searchQuery.length >= 2) && (
              <div className="max-w-2xl mx-auto mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                {isSearching ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-magenta" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2 max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors"
                      >
                        <div className="h-12 w-12 rounded-md overflow-hidden relative shrink-0 border border-border">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-extrabold text-magenta text-sm">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchOpen(false)}
                      className="block p-3 text-center text-xs font-bold uppercase tracking-widest text-magenta hover:bg-magenta/5 border-t border-border"
                    >
                      View All Results
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm font-bold">No results found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.header>


    </>
  );
}
