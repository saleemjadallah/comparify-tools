
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";

// Function to search products using the Rainforest API (via our Edge Function)
export const searchProductsFromRainforest = async (
  query: string,
  categoryName: string
): Promise<ProductSearchResult[]> => {
  if (!query || query.length < 2 || !categoryName) return [];

  try {
    console.log(`Searching Rainforest for "${query}" in category "${categoryName}"`);
    
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

    console.log(`Received ${data.results.length} results from Rainforest API`);
    
    // Log a sample result to see what data we're getting
    if (data.results.length > 0) {
      console.log('Sample result specs:', data.results[0].specs);
      console.log('Sample result description:', data.results[0].description);
      console.log('Sample rich product description:', data.results[0].rich_product_description);
    }

    return data.results as ProductSearchResult[];
  } catch (error) {
    console.error('Exception in searchProductsFromRainforest:', error);
    return [];
  }
};
