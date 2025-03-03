
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";

// Function to search products using the Rainforest API (via our Edge Function)
export const searchProductsFromRainforest = async (
  query: string,
  categoryName: string
): Promise<ProductSearchResult[]> => {
  if (!query || query.length < 2 || !categoryName) return [];

  try {
    const { data, error } = await supabase.functions.invoke('rainforest-api', {
      body: {
        searchQuery: query,
        categoryName: categoryName,
      },
    });

    if (error) {
      console.error('Error calling Rainforest API:', error);
      return [];
    }

    if (!data || !data.results) {
      console.warn('No results from Rainforest API');
      return [];
    }

    return data.results as ProductSearchResult[];
  } catch (error) {
    console.error('Exception in searchProductsFromRainforest:', error);
    return [];
  }
};
