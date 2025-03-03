
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";

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
