
import { toast } from "@/components/ui/use-toast";

/**
 * Validates that we have enough products to analyze
 */
export const validateProductCount = (products: any[]): boolean => {
  if (!products || products.length < 2) {
    console.error('Not enough products to analyze. At least 2 products are required.');
    toast({
      title: "Analysis Error",
      description: "At least 2 products are required for comparison analysis.",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

/**
 * Validates that important features are provided for analysis
 */
export const validateFeatures = (features: string[]): boolean => {
  if (!features || features.length === 0) {
    console.error('No features provided for analysis. Please specify important features.');
    toast({
      title: "Analysis Error",
      description: "Please select at least one important feature for product comparison.",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

/**
 * Logs the starting analysis information
 */
export const logAnalysisStart = (products: any[], features: string[], category: string): void => {
  console.log(`Starting analysis of ${products.length} products in category "${category}"`);
  console.log('Products being analyzed:', products.map(p => p.name).join(', '));
  console.log('Important features for analysis:', features.join(', '));
};
