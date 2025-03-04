
import { toast } from "@/components/ui/use-toast";
import { ValidationError } from "./errors";
import { logger } from "./logging";

/**
 * Validates that we have enough products to analyze
 * @throws ValidationError if there aren't enough products
 */
export const validateProductCount = (products: any[]): boolean => {
  if (!products || products.length < 2) {
    const error = new ValidationError("At least 2 products are required for comparison analysis.");
    
    logger.error('Product validation failed: not enough products', error, {
      productsCount: products?.length || 0,
      minRequired: 2
    });
    
    toast({
      title: "Analysis Error",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
  
  logger.debug('Product count validation passed', {
    productCount: products.length
  });
  
  return true;
};

/**
 * Validates that important features are provided for analysis
 * @throws ValidationError if no features are provided
 */
export const validateFeatures = (features: string[]): boolean => {
  if (!features || features.length === 0) {
    const error = new ValidationError("Please select at least one important feature for product comparison.");
    
    logger.error('Feature validation failed: no features provided', error, {
      featuresCount: features?.length || 0
    });
    
    toast({
      title: "Analysis Error",
      description: error.message,
      variant: "destructive",
    });
    
    return false;
  }
  
  logger.debug('Feature validation passed', {
    featureCount: features.length,
    features
  });
  
  return true;
};
