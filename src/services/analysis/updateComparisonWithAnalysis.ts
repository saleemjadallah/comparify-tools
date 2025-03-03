
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
      console.error('Invalid analysis data received:', analysisData);
      return false;
    }

    console.log('Analysis data to save:', JSON.stringify(analysisData, null, 2));

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

    console.log('Fetched comparison products:', comparisonProducts);

    // Map Claude analysis to database products
    for (const cpItem of comparisonProducts) {
      if (!cpItem.products) {
        console.warn('Missing product data for comparison product item');
        continue;
      }
      
      const product = cpItem.products;
      const productName = product.name;
      
      // Find matching analysis from Claude
      // Use more flexible matching to handle slight variations in product names
      const analysis = analysisData.products.find(p => 
        p.name.toLowerCase() === productName.toLowerCase() ||
        productName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(productName.toLowerCase())
      );

      if (analysis) {
        console.log(`Found matching analysis for product: ${productName}`);
        
        // Update product with analysis data
        const { error: updateError } = await supabase
          .from('products')
          .update({
            pros: analysis.pros || [],
            cons: analysis.cons || [],
            overview: analysis.overview || '',
            // Store featureRatings as a JSON object in the specs field
            specs: {
              ...(cpItem.products.specs || {}),  // Keep existing specs
              featureRatings: analysis.featureRatings || {}
            }
          })
          .eq('id', cpItem.product_id);

        if (updateError) {
          console.error(`Error updating product ${productName} with analysis:`, updateError);
        } else {
          console.log(`Successfully updated product ${productName} with analysis`);
        }
      } else {
        console.warn(`No matching analysis found for product: ${productName}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateComparisonWithAnalysis:', error);
    return false;
  }
};
