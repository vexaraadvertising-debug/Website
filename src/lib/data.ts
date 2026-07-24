export type ProductColor = { name: string; hex: string };

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  isNew: boolean;
  description: string;
  details: string[];
  colors: ProductColor[];
  sizes: string[];
  categories: string[];
}

// Live Supabase products collection empty by default until populated in database
export const MOCK_PRODUCTS: Product[] = [];

export const getProductBySlug = (slug: string) => undefined;
export const getProductsByCategory = (category: string) => [];
export const getFeaturedProducts = () => [];
