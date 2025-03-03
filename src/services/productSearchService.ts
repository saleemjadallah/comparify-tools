import { supabase } from "@/integrations/supabase/client";
import { mockProductDatabase } from "@/data/products";
import { ProductSearchResult, Product } from "./types";

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

// Main search function that combines database and mock data
export const searchProducts = async (
  query: string,
  categoryName: string
): Promise<ProductSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    // First, try to get results from the database
    const dbResults = await searchProductsFromDatabase(query, categoryName);
    
    // If we have enough results from the database, return them
    if (dbResults.length >= 3) {
      return dbResults;
    }
    
    // Otherwise, supplement with mock data
    const mockResults = searchProductsFromMock(query, categoryName);
    
    // Combine results, removing duplicates by name
    const combinedResults = [...dbResults];
    for (const mockResult of mockResults) {
      if (!combinedResults.some(r => r.name.toLowerCase() === mockResult.name.toLowerCase())) {
        combinedResults.push(mockResult);
      }
    }
    
    return combinedResults;
  } catch (error) {
    console.error('Error in searchProducts:', error);
    // Fallback to mock data if database search fails
    return searchProductsFromMock(query, categoryName);
  }
};
