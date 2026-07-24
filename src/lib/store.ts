import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './toast-store';

// --- Cart Store ---
export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color?: string;
  size?: string;
  quantity: number;
  customImage?: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export type Coupon = {
  code: string;
  discountPercentage: number;
};

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  coupon: Coupon | null;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getTotals: (isBuyNow?: boolean) => { subtotal: number; discount: number; total: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      coupon: null,
      isCartOpen: false,
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      buyNowItem: null,
      setBuyNowItem: (item) => set({ buyNowItem: item }),
      addItem: (newItem) => set((state) => {
        toast.success(`${newItem.name} added to cart`);
        const existingItem = state.items.find(item => item.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
            isCartOpen: true
          };
        }
        return { items: [...state.items, newItem], isCartOpen: true };
      }),
      removeItem: (id) => set((state) => {
        const item = state.items.find(i => i.id === id);
        if (item) toast.info(`${item.name} removed from cart`);
        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      clearCart: () => set({ items: [], buyNowItem: null }),
      addToWishlist: (newItem) => set((state) => {
        if (state.wishlist.some(item => item.id === newItem.id)) {
          return state;
        }
        toast.success(`${newItem.name} added to wishlist`);
        return { wishlist: [...state.wishlist, newItem] };
      }),
      removeFromWishlist: (id) => set((state) => {
        const item = state.wishlist.find(i => i.id === id);
        if (item) toast.info(`${item.name} removed from wishlist`);
        return {
          wishlist: state.wishlist.filter(item => item.id !== id)
        };
      }),
      applyCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'ORINKO10' || cleanCode === 'WELCOME10') {
          set({ coupon: { code: cleanCode, discountPercentage: 10 } });
          toast.success(`Coupon ${cleanCode} applied successfully!`);
          return true;
        }
        toast.error("Invalid coupon code.");
        return false;
      },
      removeCoupon: () => {
        set({ coupon: null });
        toast.info("Coupon removed");
      },
      getTotals: (isBuyNow = false) => {
        const { items, coupon, buyNowItem } = get();
        const targetItems = (isBuyNow && buyNowItem) ? [buyNowItem] : items;
        const subtotal = targetItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const originalTotal = targetItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
        let discount = originalTotal - subtotal;
        
        if (coupon) {
          const couponDiscount = (subtotal * coupon.discountPercentage) / 100;
          discount += couponDiscount;
        }

        const total = Math.max(0, originalTotal - discount);
        return { subtotal: originalTotal, discount, total };
      },
    }),
    { name: 'orinko-cart-storage' }
  )
);
