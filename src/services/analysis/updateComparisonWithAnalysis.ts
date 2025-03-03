
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResponse } from "./types";

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
