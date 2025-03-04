
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResponse } from "./types";
import { validateProductCount, validateFeatures, logAnalysisStart } from "./validation";
import { prepareProductData } from "./productDataPrep";
import { checkDataQuality, validateAndCompleteAnalysisData } from "./dataQualityCheck";
import { handleClaudeError, handleEmptyResponse, handleUnexpectedError } from "./errorHandling";

/**
 * Analyzes products using Claude AI based on important features
 */
export const analyzeProducts = async (
  products: any[],
  features: string[],
  category: string
): Promise<AnalysisResponse | null> => {
  try {
    // Validate inputs
    if (!validateProductCount(products)) return null;
    if (!validateFeatures(features)) return null;
    
    // Log analysis start information
    logAnalysisStart(products, features, category);

    // Prepare product data for Claude
    const productData = prepareProductData(products);

    // Check data quality
    checkDataQuality(productData);

    console.log('Calling Claude analysis function via Supabase Edge Function...');
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('claude-product-analysis', {
      body: JSON.stringify({
        products: productData,
        features,
        category
      })
    });

    if (error) {
      return handleClaudeError(error);
    }

    // Check if we received empty or invalid data
    if (!data) {
      return handleEmptyResponse();
    }

    console.log('Received Claude analysis response with structure:', Object.keys(data));

    // Validate and complete the response data
    return validateAndCompleteAnalysisData(data, features);
    
  } catch (error) {
    return handleUnexpectedError(error);
  }
};
