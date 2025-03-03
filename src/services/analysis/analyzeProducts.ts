
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
    // Prepare product data to send to Claude
    const productData = products.map(product => ({
      name: product.name,
      brand: product.brand,
      price: product.price,
      specs: product.specs || product.details?.specs
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

    // Map product names to ensure we match Claude's response with our original products
    // (Claude might slightly modify product names)
    const analysisData = data as AnalysisResponse;
    
    if (!analysisData || !analysisData.products || analysisData.products.length === 0) {
      console.error('Invalid response from Claude analysis function');
      return null;
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
