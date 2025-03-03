
import { Json } from "@/integrations/supabase/types";

export interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  category?: string;
  rating?: number;
  specs?: Record<string, string>;
  imageUrl?: string;
  description?: string;
  rich_product_description?: string[];
  // Enhanced data
  specifications?: any[];
  features?: string[];
  top_reviews?: any[];
  images?: string[];
  similar_products?: any[];
  variants?: any[];
}

// Define types for Supabase tables to help TypeScript
export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

// Product interface to match Supabase's data structure
export interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number | null;
  category_id: number | null;
  image_url?: string | null;
  rating?: number | null;
  description?: string | null;
  source?: string | null;
  source_id?: string | null;
  specs?: Json | null;
  pros?: string[] | null;
  cons?: string[] | null;
  rich_product_description?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Enhanced data
  specifications?: any[] | null;
  features?: string[] | null;
  top_reviews?: any[] | null;
  images?: string[] | null;
  similar_products?: any[] | null;
  variants?: any[] | null;
}

export interface Comparison {
  id: string;
  title: string | null;
  category_id: number | null;
  feature_importance?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ComparisonProduct {
  comparison_id: string;
  product_id: string;
  position: number | null;
}
