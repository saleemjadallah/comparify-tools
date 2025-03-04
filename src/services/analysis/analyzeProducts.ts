
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResponse } from "./types";
import { validateProductCount, validateFeatures } from "./validation";
import { prepareProductData } from "./productDataPrep";
import { checkDataQuality, validateAndCompleteAnalysisData } from "./dataQualityCheck";
import { handleClaudeError, handleEmptyResponse, handleUnexpectedError } from "./errorHandling";
import { logger, logAnalysisStart, logAnalysisCompletion } from "./logging";
import { 
  ServiceConnectionError, 
  ResponseParsingError, 
  DataQualityError, 
  ValidationError 
} from "./errors";

/**
 * Analyzes products using Claude AI based on important features
 */
export const analyzeProducts = async (
  products: any[],
  features: string[],
  category: string
): Promise<AnalysisResponse | null> => {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!validateProductCount(products)) return null;
    if (!validateFeatures(features)) return null;
    
    // Log analysis start information
    logAnalysisStart(products, features, category);

    // Prepare product data for Claude
    const productData = prepareProductData(products);

    // Check data quality (will throw error if serious issues are found)
    try {
      const qualityCheck = checkDataQuality(productData);
      if (qualityCheck.dataQualityIssues) {
        logger.warn("Data quality issues detected", {
          warnings: qualityCheck.dataQualityWarnings
        });
      }
    } catch (error) {
      if (error instanceof DataQualityError) {
        logger.error("Data quality check failed", error, {
          issues: error.dataIssues
        });
        return null;
      }
      throw error; // Re-throw if it's not a data quality error
    }

    logger.info('Calling Claude analysis function via Supabase Edge Function...');
    
    // Call the Supabase Edge Function with timeout handling
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

    logger.info('Received Claude analysis response', { 
      responseStructure: Object.keys(data)
    });

    // Validate and complete the response data
    try {
      const validatedData = validateAndCompleteAnalysisData(data, features);
      
      // Log completion
      const endTime = Date.now();
      logAnalysisCompletion(
        validatedData.products.length, 
        features.length,
        endTime - startTime
      );
      
      return validatedData;
    } catch (error) {
      if (error instanceof ResponseParsingError) {
        logger.error("Response validation failed", error);
        return null;
      }
      throw error; // Re-throw if it's not a response parsing error
    }
    
  } catch (error) {
    return handleUnexpectedError(error);
  }
};
