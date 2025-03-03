
import { supabase } from "@/integrations/supabase/client";
import { Comparison, ComparisonProduct } from "./types";

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
