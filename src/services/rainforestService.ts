
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
    
    // Log details about the data structure we received
    if (data.results.length > 0) {
      // Log the first result's structure to understand the data
      const firstResult = data.results[0];
      console.log('Sample result structure:', Object.keys(firstResult));
      console.log('Sample result specs structure:', firstResult.specs ? Object.keys(firstResult.specs).length : 'No specs');
      console.log('Sample result specifications:', firstResult.specifications ? firstResult.specifications.length : 'None');
      console.log('Sample result features:', firstResult.features ? firstResult.features.length : 'None');
      console.log('Sample result description length:', firstResult.description ? firstResult.description.length : 'No description');
      console.log('Sample rich product description:', firstResult.rich_product_description ? firstResult.rich_product_description.length : 'None');
      console.log('Sample top reviews:', firstResult.top_reviews ? firstResult.top_reviews.length : 'None');
      
      // Log some examples of actual spec values for debugging
      if (firstResult.specs) {
        console.log('Sample specs examples:');
        Object.entries(firstResult.specs).slice(0, 5).forEach(([key, value]) => {
          console.log(`  - ${key}: ${value}`);
        });
      }
      
      // Log specifications structure if available
      if (firstResult.specifications && firstResult.specifications.length > 0) {
        console.log('Sample specifications structure:');
        firstResult.specifications.slice(0, 2).forEach((spec: any, i: number) => {
          console.log(`  - Group ${i+1}: ${spec.name || 'Unnamed'}`);
          if (spec.specifications) {
            spec.specifications.slice(0, 2).forEach((subSpec: any, j: number) => {
              console.log(`    - ${j+1}: ${subSpec.name || 'Unnamed'}: ${subSpec.value || 'No value'}`);
            });
          }
        });
      }
    }

    // Transform the results using our enhanced spec processor
    return data.results.map((item: any) => {
      console.log(`Processing item: ${item.name} (${item.id})`);
      
      // Process the specs with our enhanced processing system
      console.log('Processing specs with enhancedSpecProcessing...');
      const enhancedSpecs = enhancedSpecProcessing(item, categoryName);
      console.log(`Enhanced specs generated with ${Object.keys(enhancedSpecs).length} categories`);
      
      // Flatten the enhanced specs for storage compatibility
      console.log('Flattening enhanced specs...');
      const flattenedSpecs = flattenEnhancedSpecs(enhancedSpecs);
      console.log(`Flattened specs contains ${Object.keys(flattenedSpecs).length} properties`);
      
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
