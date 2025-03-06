
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple Claude Analysis Service that directly sends product data to Claude
 * with minimal processing, based on user preferences
 */

export interface FeatureRating {
  rating: number;
  explanation: string;
  confidence: string;
}

export interface ProductAnalysis {
  name: string;
  overview: string;
  pros: string[];
  cons: string[];
  featureRatings: Record<string, FeatureRating>;
}

export interface AnalysisResponse {
  products: ProductAnalysis[];
  personalizedRecommendations: {
    productId: string;
    recommendationType: string;
    reasoning: string;
    standoutFeatures: string[];
    relevantTradeoffs: string;
  }[];
  dataCompleteness?: {
    overallCompleteness: string;
    missingKeyData: string[];
    inferredData?: string[];
  };
}

/**
 * Direct analysis of products using Claude AI based on user-selected features
 * Simplified approach that sends the raw data directly to Claude
 */
export const directAnalyzeProducts = async (
  products: any[],
  features: string[],
  category: string
): Promise<AnalysisResponse | null> => {
  try {
    console.log(`Starting direct Claude analysis for ${products.length} products in ${category} category`);
    console.log(`User-selected important features: ${features.join(', ')}`);
    
    // Validation
    if (!products || products.length < 2) {
      console.error('At least two products are required for analysis');
      return null;
    }

    if (!features || features.length === 0) {
      console.error('At least one feature is required for analysis');
      return null;
    }

    // Call the Supabase Edge Function with extended timeout
    const { data, error } = await supabase.functions.invoke('claude-product-analysis', {
      body: JSON.stringify({
        products,
        features,
        category
      }),
      options: {
        timeout: 300000 // 5-minute timeout (in milliseconds)
      }
    });

    if (error) {
      console.error('Error calling Claude analysis:', error);
      return null;
    }

    if (!data) {
      console.error('Empty response from Claude analysis');
      return null;
    }

    console.log('Received Claude analysis response');
    
    // Provide some basic validation to ensure the response has the expected structure
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid response format: missing products array');
      return null;
    }

    return data as AnalysisResponse;
  } catch (error) {
    console.error('Unexpected error in Claude analysis:', error);
    return null;
  }
};

/**
 * Update a comparison with analysis data
 */
export const updateComparisonWithAnalysis = async (
  comparisonId: string,
  analysisData: AnalysisResponse
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comparisons')
      .update({
        ai_analysis: analysisData,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', comparisonId);

    if (error) {
      console.error('Error updating comparison with analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating comparison:', error);
    return false;
  }
};
