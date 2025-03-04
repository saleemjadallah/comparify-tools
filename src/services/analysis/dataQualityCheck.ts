
import { toast } from "@/components/ui/use-toast";

/**
 * Checks the quality of product data and logs any issues
 * Returns an object with information about any data quality issues found
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
    console.warn('Data quality issues detected that may affect analysis quality:');
    dataQualityWarnings.forEach(warning => console.warn(`- ${warning}`));
    console.warn('Proceeding with analysis but results may be limited');
  }

  return {
    dataQualityIssues,
    dataQualityWarnings,
    missingFeaturesCount: {total: 0, byProduct: {}}
  };
};

/**
 * Validates analysis response data and fills in any missing features
 */
export const validateAndCompleteAnalysisData = (analysisData: any, features: string[]) => {
  const missingFeaturesCount = {total: 0, byProduct: {} as Record<string, number>};
  
  if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
    console.error('Invalid response from Claude analysis function:', analysisData);
    toast({
      title: "Analysis Error",
      description: "The AI service returned an invalid analysis format. Your comparison will be created without AI insights.",
      variant: "destructive",
    });
    return null;
  }

  // Log analysis results summary
  console.log(`Successfully analyzed ${analysisData.products.length} products:`);
  analysisData.products.forEach((product: any) => {
    console.log(`- ${product.name}: ${Object.keys(product.featureRatings || {}).length} feature ratings`);
  });

  // Validate each product has the expected structure and handle missing data
  for (const product of analysisData.products) {
    if (!product.name) {
      console.warn('Product in analysis is missing name:', product);
      product.name = "Unknown Product";
    }
    
    // Ensure featureRatings exists and has entries for our important features
    if (!product.featureRatings) {
      console.warn(`Product "${product.name}" is missing featureRatings entirely`);
      product.featureRatings = {};
      missingFeaturesCount.total += features.length;
      missingFeaturesCount.byProduct[product.name] = features.length;
    }
    
    // Create empty ratings for any missing features
    for (const feature of features) {
      if (!product.featureRatings[feature]) {
        console.warn(`Feature "${feature}" is missing for product "${product.name}"`);
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
      console.warn(`Product "${product.name}" is missing overview`);
      product.overview = "No product overview available.";
    }
    
    if (!product.pros || !Array.isArray(product.pros) || product.pros.length === 0) {
      console.warn(`Product "${product.name}" is missing pros`);
      product.pros = ["No pros analysis available."];
    }
    
    if (!product.cons || !Array.isArray(product.cons) || product.cons.length === 0) {
      console.warn(`Product "${product.name}" is missing cons`);
      product.cons = ["No cons analysis available."];
    }
  }
  
  // If we had to fill in too many missing features, warn the user
  if (missingFeaturesCount.total > 0) {
    console.warn(`Had to create ${missingFeaturesCount.total} missing feature ratings`);
    
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
