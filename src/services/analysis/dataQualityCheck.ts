import { AnalysisResponse, ProductAnalysis } from "./types";
import { ResponseParsingError, DataQualityError } from "./errors";
import { logger } from "./logging";
import { toast } from "@/components/ui/use-toast";

/**
 * Validates the completeness and correctness of analysis data returned from Claude
 */
export const validateAndCompleteAnalysisData = (
  data: any,
  requestedFeatures: string[]
): AnalysisResponse => {
  logger.debug("Validating analysis data...");
  
  try {
    // Check if the response has the expected structure
    if (!data || !data.products || !Array.isArray(data.products)) {
      throw new ResponseParsingError("Invalid response format: missing products array");
    }
    
    // Extract products from the response
    const products: ProductAnalysis[] = data.products.map((product: any) => {
      if (!product.name) {
        throw new ResponseParsingError("Product missing name");
      }
      
      // Ensure all products have the required fields, with defaults if missing
      return {
        name: product.name,
        overview: product.overview || "No overview available",
        pros: product.pros || [],
        cons: product.cons || [],
        featureRatings: product.featureRatings || {}
      };
    });
    
    // Ensure every product has ratings for all the requested features
    products.forEach((product: ProductAnalysis) => {
      requestedFeatures.forEach(feature => {
        if (!product.featureRatings[feature]) {
          logger.warn(`Feature rating missing for ${feature} in ${product.name}, creating default`);
          product.featureRatings[feature] = {
            rating: 5,
            explanation: "No data available for this feature",
            confidence: "low"
          };
        }
      });
    });
    
    // Return the validated data
    return {
      products,
      personalizedRecommendations: data.personalizedRecommendations || [],
      dataCompleteness: data.dataCompleteness || {
        overallCompleteness: "unknown",
        missingKeyData: [],
        inferredData: []
      }
    };
  } catch (error) {
    if (error instanceof ResponseParsingError) {
      throw error;
    }
    
    // If it's another type of error, wrap it in a ResponseParsingError
    throw new ResponseParsingError(
      `Failed to validate analysis data: ${(error as Error).message}`
    );
  }
};

/**
 * Checks for data quality issues in product data before sending to Claude
 * Returns information about data quality to enable better handling
 */
export const checkDataQuality = (products: any[]): { 
  dataQualityIssues: boolean;
  dataQualityWarnings: string[];
} => {
  const warnings: string[] = [];
  let hasSerious = false;

  products.forEach(product => {
    if (!product.description && (!product.rawData || !product.rawData.description)) {
      warnings.push(`Missing description for product: ${product.name}`);
    }

    if (Object.keys(product.specs).length === 0 &&
        (!product.rawData || !product.rawData.specifications_flat || Object.keys(product.rawData.specifications_flat).length === 0)) {
      warnings.push(`Missing specifications for product: ${product.name}`);
    }

    if (product.features.length === 0 &&
        (!product.rawData || !product.rawData.feature_bullets_flat || product.rawData.feature_bullets_flat.length === 0) &&
        (!product.rich_product_description || product.rich_product_description.length === 0)) {
      warnings.push(`Missing features for product: ${product.name}`);
    }
  });

  // If all products have issues, we consider it a serious problem
  if (warnings.length >= products.length * 2) {
    hasSerious = true;
  }

  // For serious issues throw an error
  if (hasSerious) {
    throw new DataQualityError("Data quality issues found", warnings);
  }

  // Otherwise just return the warnings
  return { 
    dataQualityIssues: warnings.length > 0,
    dataQualityWarnings: warnings
  };
};
