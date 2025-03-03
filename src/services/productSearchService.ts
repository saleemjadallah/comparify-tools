import { supabase } from "@/integrations/supabase/client";
import { mockProductDatabase } from "@/data/products";
import { ProductSearchResult, Product } from "./types";
import { searchProductsFromRainforest } from "./rainforestService";

// Function to search products from internal database
export const searchProductsFromDatabase = async (
  query: string,
  categoryName: string
): Promise<ProductSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    // First try to get the category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (categoryError || !categoryData?.id) {
      console.error('Error finding category:', categoryError);
      return [];
    }

    // Then search for products in that category
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryData.id)
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching database products:', error);
      return [];
    }

    // Update the transformation to properly handle nulls and type casting
    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand || '',
      price: item.price || 0,
      rating: item.rating || undefined,
      // Safe type conversion for specs
      specs: item.specs ? (item.specs as Record<string, string>) : undefined,
      imageUrl: item.image_url || undefined
    }));
  } catch (error) {
    console.error('Error in searchProductsFromDatabase:', error);
    return [];
  }
};

// Function to search for products from mock data (fallback)
export const searchProductsFromMock = (
  query: string,
  categoryName: string
): ProductSearchResult[] => {
  if (!query || query.length < 2 || !categoryName) return [];

  // Filter products based on the query and selected category
  const categoryProducts = mockProductDatabase[categoryName as keyof typeof mockProductDatabase] || [];
  const results = categoryProducts.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.brand.toLowerCase().includes(query.toLowerCase())
  );

  // Add mock rating and specs data for demo purposes
  return results.map(result => ({
    ...result,
    rating: Math.floor(Math.random() * 2) + 3 + Math.random(), // Random rating between 3.0 and 5.0
    specs: {
      "Color": ["Black", "Silver", "White"][Math.floor(Math.random() * 3)],
      "Memory": ["4GB", "8GB", "16GB"][Math.floor(Math.random() * 3)],
      "Storage": ["128GB", "256GB", "512GB"][Math.floor(Math.random() * 3)]
    }
  }));
};

// Main search function that combines database, rainforest, and mock data
export const searchProducts = async (
  query: string,
  categoryName: string
): Promise<ProductSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    // First, try to get results from the database
    const dbResults = await searchProductsFromDatabase(query, categoryName);
    
    // Then, try to get results from Rainforest API
    const rainforestResults = await searchProductsFromRainforest(query, categoryName);
    
    // Combine results from both sources
    let combinedResults = [...dbResults, ...rainforestResults];
    
    // If we have enough results, return them
    if (combinedResults.length >= 3) {
      return combinedResults;
    }
    
    // Otherwise, supplement with mock data
    const mockResults = searchProductsFromMock(query, categoryName);
    
    // Add mock results, removing duplicates by name
    for (const mockResult of mockResults) {
      if (!combinedResults.some(r => r.name.toLowerCase() === mockResult.name.toLowerCase())) {
        combinedResults.push(mockResult);
      }
    }
    
    return combinedResults;
  } catch (error) {
    console.error('Error in searchProducts:', error);
    // Fallback to mock data if everything else fails
    return searchProductsFromMock(query, categoryName);
  }
};

// Re-export the rainforest search function from rainforestService
export { searchProductsFromRainforest } from "./rainforestService";
