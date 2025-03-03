
import { supabase } from "@/integrations/supabase/client";
import { mockProductDatabase } from "@/data/products";
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
}

// Define types for Supabase tables to help TypeScript
interface Category {
  id: number;
  name: string;
  created_at?: string;
}

// Update the Product interface to match Supabase's data structure
interface Product {
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
  created_at?: string | null;
  updated_at?: string | null;
}

interface Comparison {
  id: string;
  title: string | null;
  category_id: number | null;
  feature_importance?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ComparisonProduct {
  comparison_id: string;
  product_id: string;
  position: number | null;
}

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

// Function to save a product to database
export const saveProduct = async (product: ProductSearchResult, categoryName: string): Promise<string> => {
  try {
    // Get category id
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    if (categoryError || !categoryData?.id) {
      console.error('Error finding category:', categoryError);
      throw new Error(`Category not found: ${categoryName}`);
    }

    // Prepare product data
    const productData = {
      name: product.name,
      brand: product.brand,
      price: product.price,
      category_id: categoryData.id,
      rating: product.rating,
      specs: product.specs,
      image_url: product.imageUrl,
      source: 'manual',
      source_id: product.id
    };

    // Check if product already exists
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('name', product.name)
      .eq('brand', product.brand)
      .eq('category_id', categoryData.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing product:', existingError);
    }

    if (existingProduct?.id) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id);
      
      if (error) throw error;
      return existingProduct.id;
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to retrieve new product ID');
      
      return data.id;
    }
  } catch (error) {
    console.error('Error saving product:', error);
    return '';
  }
};

// Function to save a comparison
export const saveComparison = async (
  categoryName: string,
  productIds: string[],
  featureImportance: string[]
): Promise<string> => {
  try {
    // Get category id
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    if (categoryError || !categoryData?.id) {
      console.error('Error finding category:', categoryError);
      throw new Error(`Category not found: ${categoryName}`);
    }

    // Insert comparison
    const comparisonData: Omit<Comparison, 'id' | 'created_at' | 'updated_at'> = {
      title: `${categoryName} Comparison`,
      category_id: categoryData.id,
      feature_importance: featureImportance
    };

    const { data: comparisonResult, error: comparisonError } = await supabase
      .from('comparisons')
      .insert(comparisonData)
      .select('id')
      .single();
    
    if (comparisonError) {
      console.error('Error creating comparison:', comparisonError);
      throw comparisonError;
    }
    
    if (!comparisonResult) {
      throw new Error('Failed to retrieve new comparison ID');
    }
    
    // Insert comparison products
    const comparisonProducts: ComparisonProduct[] = productIds.map((productId, index) => ({
      comparison_id: comparisonResult.id,
      product_id: productId,
      position: index + 1
    }));
    
    const { error: productsError } = await supabase
      .from('comparison_products')
      .insert(comparisonProducts);
    
    if (productsError) {
      console.error('Error adding products to comparison:', productsError);
      throw productsError;
    }
    
    return comparisonResult.id;
  } catch (error) {
    console.error('Error saving comparison:', error);
    return '';
  }
};

// Function to get comparison data
export const getComparison = async (comparisonId: string) => {
  try {
    // Get comparison details
    const { data: comparison, error } = await supabase
      .from('comparisons')
      .select(`
        id, 
        title,
        feature_importance,
        categories(name)
      `)
      .eq('id', comparisonId)
      .single();
    
    if (error) {
      console.error('Error getting comparison:', error);
      throw error;
    }
    
    if (!comparison) {
      throw new Error('Comparison not found');
    }
    
    // Get products in this comparison
    const { data: comparisonProducts, error: productsError } = await supabase
      .from('comparison_products')
      .select(`
        position,
        products(*)
      `)
      .eq('comparison_id', comparisonId)
      .order('position');
    
    if (productsError) {
      console.error('Error getting comparison products:', productsError);
      throw productsError;
    }
    
    // Format the data
    const products = comparisonProducts.map((cp: any) => ({
      id: cp.products.id,
      name: cp.products.name,
      brand: cp.products.brand,
      price: cp.products.price,
      image: cp.products.image_url || '/placeholder.svg',
      rating: cp.products.rating,
      specs: cp.products.specs,
      pros: cp.products.pros || [],
      cons: cp.products.cons || []
    }));
    
    return {
      id: comparison.id,
      title: comparison.title,
      category: comparison.categories.name,
      featureImportance: comparison.feature_importance,
      products
    };
  } catch (error) {
    console.error('Error getting comparison:', error);
    return null;
  }
};

