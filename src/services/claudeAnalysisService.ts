
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Interface for feature ratings
interface FeatureRating {
  rating: number;
  explanation: string;
}

// Interface for product analysis
export interface ProductAnalysis {
  name: string;
  overview: string;
  pros: string[];
  cons: string[];
  featureRatings: Record<string, FeatureRating>;
}

// Interface for the complete analysis response
export interface AnalysisResponse {
  products: ProductAnalysis[];
}

/**
 * Analyzes products using Claude AI based on important features
 */
export const analyzeProducts = async (
  products: any[],
  features: string[],
  category: string
): Promise<AnalysisResponse | null> => {
  try {
    // Prepare product data to send to Claude
    const productData = products.map(product => ({
      name: product.name,
      brand: product.brand,
      price: product.price,
      specs: product.specs || product.details?.specs
    }));

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('claude-product-analysis', {
      body: JSON.stringify({
        products: productData,
        features,
        category
      })
    });

    if (error) {
      console.error('Error calling Claude analysis function:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze products. Please try again later.",
        variant: "destructive",
      });
      return null;
    }

    // Map product names to ensure we match Claude's response with our original products
    // (Claude might slightly modify product names)
    const analysisData = data as AnalysisResponse;
    
    if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
      console.error('Invalid response from Claude analysis function');
      return null;
    }

    return analysisData;
  } catch (error) {
    console.error('Error in analyzeProducts:', error);
    toast({
      title: "Analysis Failed",
      description: "An error occurred while analyzing the products.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Updates a comparison with Claude AI analysis
 */
export const updateComparisonWithAnalysis = async (
  comparisonId: string,
  analysisData: AnalysisResponse
): Promise<boolean> => {
  try {
    if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
      return false;
    }

    // First, get the existing comparison products
    const { data: comparisonProducts, error: fetchError } = await supabase
      .from('comparison_products')
      .select(`
        comparison_id,
        product_id,
        position,
        products(id, name)
      `)
      .eq('comparison_id', comparisonId);

    if (fetchError) {
      console.error('Error fetching comparison products:', fetchError);
      return false;
    }

    if (!comparisonProducts || comparisonProducts.length === 0) {
      console.error('No comparison products found for this comparison');
      return false;
    }

    // Map Claude analysis to database products
    for (const cpItem of comparisonProducts) {
      const product = cpItem.products;
      if (product) {
        const productName = product.name;
        
        // Find matching analysis from Claude
        const analysis = analysisData.products.find(p => 
          p.name.toLowerCase() === productName.toLowerCase() ||
          productName.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (analysis) {
          // Update product with analysis data
          const { error: updateError } = await supabase
            .from('products')
            .update({
              pros: analysis.pros,
              cons: analysis.cons,
              overview: analysis.overview,
              feature_ratings: analysis.featureRatings
            })
            .eq('id', cpItem.product_id);

          if (updateError) {
            console.error(`Error updating product ${productName} with analysis:`, updateError);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateComparisonWithAnalysis:', error);
    return false;
  }
};
