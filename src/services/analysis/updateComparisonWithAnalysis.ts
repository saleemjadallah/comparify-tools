
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResponse, FeatureRating } from "./types";
import { Json } from "@/integrations/supabase/types";

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
        products(id, name, specs)
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
    let updateSuccess = false;
    
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
        
        // Create a new specs object by merging existing specs (if any) with the feature ratings
        // Ensure specs is an object before spreading
        const existingSpecs = (product.specs && typeof product.specs === 'object') ? product.specs : {};
        
        // Convert FeatureRating objects to plain objects that match the Json type
        const featureRatingsJson: Record<string, { rating: number; explanation: string }> = {};
        
        // If we have feature ratings, convert them to a format compatible with Json type
        if (analysis.featureRatings) {
          Object.entries(analysis.featureRatings).forEach(([key, value]) => {
            featureRatingsJson[key] = {
              rating: value.rating,
              explanation: value.explanation
            };
          });
        }
        
        // Prepare update data - ensuring it's all JSON-compatible
        const updateData = {
          pros: analysis.pros || [],
          cons: analysis.cons || [],
          overview: analysis.overview || '',
          // Store featureRatings as a JSON object in the specs field
          specs: {
            ...existingSpecs,
            featureRatings: featureRatingsJson
          }
        };
        
        // Update product with analysis data
        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', cpItem.product_id);

        if (updateError) {
          console.error(`Error updating product ${productName} with analysis:`, updateError);
        } else {
          console.log(`Successfully updated product ${productName} with analysis`);
          updateSuccess = true;
        }
      } else {
        console.warn(`No matching analysis found for product: ${productName}`);
      }
    }

    return updateSuccess;
  } catch (error) {
    console.error('Error in updateComparisonWithAnalysis:', error);
    return false;
  }
};
