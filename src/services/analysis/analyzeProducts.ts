
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
      console.error('Not enough products to analyze');
      return null;
    }

    if (!features || features.length === 0) {
      console.error('No features provided for analysis');
      return null;
    }

    console.log('Analyzing products:', products.map(p => p.name).join(', '));
    console.log('Important features:', features.join(', '));
    console.log('Category:', category);

    // Prepare product data to send to Claude
    const productData = products.map(product => ({
      name: product.name,
      brand: product.brand || 'Unknown',
      price: product.price || 'Unknown',
      specs: product.specs || product.details?.specs || {}
    }));

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
      toast({
        title: "Analysis Failed",
        description: "Could not analyze products. Please try again later.",
        variant: "destructive",
      });
      return null;
    }

    console.log('Raw response from Claude API:', data);

    // Validate the response structure
    const analysisData = data as AnalysisResponse;
    
    if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
      console.error('Invalid response from Claude analysis function:', data);
      toast({
        title: "Analysis Failed",
        description: "Received invalid response from the AI service.",
        variant: "destructive",
      });
      return null;
    }

    // Validate each product has the expected structure
    for (const product of analysisData.products) {
      if (!product.name || !product.featureRatings) {
        console.warn('Product in analysis is missing required fields:', product);
      }
      
      // Ensure featureRatings exists and has entries for our important features
      if (!product.featureRatings) {
        product.featureRatings = {};
      }
      
      // Create empty ratings for any missing features
      for (const feature of features) {
        if (!product.featureRatings[feature]) {
          console.warn(`Feature "${feature}" is missing for product "${product.name}"`);
          
          // Add a placeholder rating
          product.featureRatings[feature] = {
            rating: 5, // Default middle rating
            explanation: "No analysis available for this feature."
          };
        }
      }
    }

    return analysisData;
  } catch (error) {
    console.error('Error in analyzeProducts:', error);
    toast({
      title: "Analysis Failed",
      description: "An error occurred while analyzing the products.",
      variant: "destructive",
    });
    return null;
  }
};
