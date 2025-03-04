
import { toast } from "@/components/ui/use-toast";
import { DataQualityError, ResponseParsingError } from "./errors";
import { logger } from "./logging";

/**
 * Checks the quality of product data and logs any issues
 * @throws DataQualityError if serious data issues are found
 */
export const checkDataQuality = (productData: any[]): {
  dataQualityIssues: boolean;
  dataQualityWarnings: string[];
  missingFeaturesCount: {total: number, byProduct: Record<string, number>};
} => {
  let dataQualityIssues = false;
  const dataQualityWarnings = productData.map(product => {
    const issues = [];
    
    if (!product.description || product.description.length < 50) {
      issues.push(`Missing or very short description`);
    }
    
    if (!product.features || product.features.length === 0) {
      issues.push(`No feature bullets available`);
    }
    
    if (!product.specs || Object.keys(product.specs).length < 3) {
      issues.push(`Few or no specifications available`);
    }
    
    if (issues.length > 0) {
      dataQualityIssues = true;
      return `"${product.name}": ${issues.join(', ')}`;
    }
    return null;
  }).filter(Boolean);
  
  if (dataQualityIssues) {
    logger.warn('Data quality issues detected that may affect analysis quality', {
      dataQualityWarnings,
      productCount: productData.length
    });
    
    // Only throw a serious error if all products have serious issues
    if (dataQualityWarnings.length === productData.length) {
      throw new DataQualityError(
        "Insufficient product data for meaningful analysis.", 
        dataQualityWarnings
      );
    }
  }

  return {
    dataQualityIssues,
    dataQualityWarnings,
    missingFeaturesCount: {total: 0, byProduct: {}}
  };
};

/**
 * Validates analysis response data and fills in any missing features
 * @throws ResponseParsingError if the response format is invalid
 */
export const validateAndCompleteAnalysisData = (analysisData: any, features: string[]) => {
  const missingFeaturesCount = {total: 0, byProduct: {} as Record<string, number>};
  
  if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
    logger.error('Invalid response from Claude analysis function', null, { 
      analysisData
    });
    
    throw new ResponseParsingError(
      "The AI service returned an invalid analysis format. Your comparison will be created without AI insights."
    );
  }

  // Log analysis results summary
  logger.info(`Successfully analyzed ${analysisData.products.length} products`, {
    productNames: analysisData.products.map((p: any) => p.name)
  });

  // Validate each product has the expected structure and handle missing data
  for (const product of analysisData.products) {
    if (!product.name) {
      logger.warn('Product in analysis is missing name', {
        product
      });
      product.name = "Unknown Product";
    }
    
    // Ensure featureRatings exists and has entries for our important features
    if (!product.featureRatings) {
      logger.warn(`Product "${product.name}" is missing featureRatings entirely`);
      product.featureRatings = {};
      missingFeaturesCount.total += features.length;
      missingFeaturesCount.byProduct[product.name] = features.length;
    }
    
    // Create empty ratings for any missing features
    for (const feature of features) {
      if (!product.featureRatings[feature]) {
        logger.warn(`Feature "${feature}" is missing for product "${product.name}"`);
        missingFeaturesCount.total++;
        missingFeaturesCount.byProduct[product.name] = (missingFeaturesCount.byProduct[product.name] || 0) + 1;
        
        // Add a placeholder rating
        product.featureRatings[feature] = {
          rating: 5, // Default middle rating
          explanation: "No analysis available for this feature."
        };
      }
    }
    
    // Ensure other required fields exist
    if (!product.overview) {
      logger.warn(`Product "${product.name}" is missing overview`);
      product.overview = "No product overview available.";
    }
    
    if (!product.pros || !Array.isArray(product.pros) || product.pros.length === 0) {
      logger.warn(`Product "${product.name}" is missing pros`);
      product.pros = ["No pros analysis available."];
    }
    
    if (!product.cons || !Array.isArray(product.cons) || product.cons.length === 0) {
      logger.warn(`Product "${product.name}" is missing cons`);
      product.cons = ["No cons analysis available."];
    }
  }
  
  // If we had to fill in too many missing features, warn the user
  if (missingFeaturesCount.total > 0) {
    logger.warn(`Had to create ${missingFeaturesCount.total} missing feature ratings`, {
      missingFeaturesCount
    });
    
    if (missingFeaturesCount.total > features.length) {
      // Only show a toast if a significant number of features are missing
      toast({
        title: "Partial Analysis",
        description: `Some product features couldn't be analyzed. The comparison may have limited insights.`,
        variant: "destructive",
      });
    }
  }

  return analysisData;
};
