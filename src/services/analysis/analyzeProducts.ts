
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { AnalysisResponse } from "./types";

/**
 * Analyzes products using Claude AI based on important features
 */
export const analyzeProducts = async (
  products: any[],
  features: string[],
  category: string
): Promise<AnalysisResponse | null> => {
  try {
    // Make sure we have valid inputs
    if (!products || products.length < 2) {
      console.error('Not enough products to analyze. At least 2 products are required.');
      toast({
        title: "Analysis Error",
        description: "At least 2 products are required for comparison analysis.",
        variant: "destructive",
      });
      return null;
    }

    if (!features || features.length === 0) {
      console.error('No features provided for analysis. Please specify important features.');
      toast({
        title: "Analysis Error",
        description: "Please select at least one important feature for product comparison.",
        variant: "destructive",
      });
      return null;
    }

    console.log(`Starting analysis of ${products.length} products in category "${category}"`);
    console.log('Products being analyzed:', products.map(p => p.name).join(', '));
    console.log('Important features for analysis:', features.join(', '));

    // Prepare product data to send to Claude, ensuring we include the key Rainforest API fields
    const productData = products.map(product => {
      // Create a base product object with essential fields
      const productInfo = {
        name: product.name,
        brand: product.brand || 'Unknown',
        price: product.price || 'Unknown',
        specs: product.specs || product.details?.specs || {},
        id: product.id || crypto.randomUUID(),
        
        // These are the three key fields from Rainforest API we want to focus on
        description: product.description || '',
        features: product.features || [],
        rich_product_description: product.rich_product_description || [],
        
        // Include raw data for access to all available fields
        rawData: {
          ...product,
          // Explicitly map the three key Rainforest API fields we want to focus on
          description: product.description || '',
          feature_bullets_flat: product.features || product.rich_product_description || [],
          specifications_flat: product.specs || {}
        }
      };
      
      console.log(`Prepared data for "${product.name}" with the following key information:`);
      console.log(`- Brand: ${productInfo.brand}`);
      console.log(`- Specifications count: ${Object.keys(productInfo.specs).length}`);
      console.log(`- Description available: ${productInfo.description ? 'Yes' : 'No'}`);
      console.log(`- Feature bullets count: ${productInfo.features.length}`);
      
      if (product.description) {
        console.log(`- Description excerpt: ${product.description.substring(0, 100)}...`);
      } else {
        console.warn(`- No description available for "${product.name}"`);
      }
      
      if (productInfo.features.length === 0) {
        console.warn(`- No feature bullets available for "${product.name}"`);
      }
      
      if (Object.keys(productInfo.specs).length === 0) {
        console.warn(`- No specifications available for "${product.name}"`);
      }
      
      return productInfo;
    });

    // Validate if we have enough data to proceed with analysis
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
      console.error('Error calling Claude analysis function:', error);
      
      // Provide more detailed error messages based on error type
      let errorMessage = "Could not analyze products.";
      let errorDetail = "";
      
      if (error.message.includes("non-2xx status code")) {
        errorMessage = "AI service unavailable";
        errorDetail = "The AI service is currently unavailable or overloaded. Your comparison will be created without AI analysis.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error";
        errorDetail = "Could not connect to the AI service. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout";
        errorDetail = "The AI analysis took too long to complete. Your comparison will be created without AI analysis.";
      } else if (error.message.includes("quota")) {
        errorMessage = "Service quota exceeded";
        errorDetail = "The AI service usage limit has been reached. Your comparison will be created without AI analysis.";
      }
      
      toast({
        title: errorMessage,
        description: errorDetail || error.message,
        variant: "destructive",
      });
      return null;
    }

    // Check if we received empty or invalid data
    if (!data) {
      console.error('Empty response from Claude analysis function');
      toast({
        title: "Analysis Unavailable",
        description: "Received empty response from the AI service. Your comparison will be created without AI analysis.",
        variant: "destructive",
      });
      return null;
    }

    console.log('Received Claude analysis response with structure:', Object.keys(data));

    // Validate the response structure
    const analysisData = data as AnalysisResponse;
    
    if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
      console.error('Invalid response from Claude analysis function:', data);
      toast({
        title: "Analysis Error",
        description: "The AI service returned an invalid analysis format. Your comparison will be created without AI insights.",
        variant: "destructive",
      });
      return null;
    }

    // Log analysis results summary
    console.log(`Successfully analyzed ${analysisData.products.length} products:`);
    analysisData.products.forEach(product => {
      console.log(`- ${product.name}: ${Object.keys(product.featureRatings || {}).length} feature ratings`);
    });

    // Validate each product has the expected structure and handle missing data
    const missingFeaturesCount = {total: 0, byProduct: {} as Record<string, number>};
    
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
      const productsMissingFeatures = Object.keys(missingFeaturesCount.byProduct);
      
      if (missingFeaturesCount.total > features.length) {
        // Only show a toast if a significant number of features are missing
        toast({
          title: "Partial Analysis",
          description: `Some product features couldn't be analyzed. The comparison may have limited insights.`,
          variant: "warning",
        });
      }
    }

    return analysisData;
  } catch (error) {
    console.error('Unexpected error in analyzeProducts:', error);
    toast({
      title: "Analysis Error",
      description: error instanceof Error 
        ? `An unexpected error occurred: ${error.message}` 
        : "An unknown error occurred while analyzing the products. Your comparison will be created without AI analysis.",
      variant: "destructive",
    });
    return null;
  }
};
