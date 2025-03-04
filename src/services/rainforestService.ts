import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";
import { enhancedSpecProcessing, flattenEnhancedSpecs } from "@/utils/enhancedSpecProcessing";

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
        limit: 3 // Limit to top 3 results to stay within API quota
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
      
      // Log the enhanced data
      console.log('Sample specifications:', data.results[0].specifications);
      console.log('Sample features:', data.results[0].features);
      console.log('Sample top reviews:', data.results[0].top_reviews);
    }

    // Transform the results using our enhanced spec processor
    return data.results.map((item: any) => {
      // Process the specs with our enhanced processing system
      const enhancedSpecs = enhancedSpecProcessing(item, categoryName);
      
      // Flatten the enhanced specs for storage compatibility
      const flattenedSpecs = flattenEnhancedSpecs(enhancedSpecs);
      
      return {
        id: item.id,
        name: item.name,
        brand: item.brand || '',
        price: item.price || 0,
        category: categoryName,
        rating: item.rating,
        specs: flattenedSpecs, // Use our enhanced and flattened specs
        imageUrl: item.imageUrl || '',
        description: item.description || '',
        rich_product_description: item.rich_product_description || [],
        // Keep the original detailed data too
        specifications: item.specifications || [],
        features: item.features || [],
        top_reviews: item.top_reviews || [],
        images: item.images || [],
        similar_products: item.similar_products || [],
        variants: item.variants || [],
        // Add the enhanced specs as a separate property for future use
        enhancedSpecs: enhancedSpecs
      };
    });
  } catch (error) {
    console.error('Exception in searchProductsFromRainforest:', error);
    return [];
  }
};
