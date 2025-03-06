import { supabase } from "@/integrations/supabase/client";

/**
 * Interfaces for the Claude AI product analysis response
 */

export interface FeatureComparison {
  featureName: string;
  description: string;
  productAssessments: {
    productId: string;
    rating: number;
    assessment: string;
    technicalDetails: string[];
    practicalImplications: string;
    confidenceLevel: "high" | "medium" | "low";
    confidenceReason?: string;
  }[];
  verdict: {
    bestProduct: string;
    explanation: string;
  };
}

export interface ProductStrengthWeakness {
  productId: string;
  strengths: {
    title: string;
    explanation: string;
    evidence: string;
  }[];
  weaknesses: {
    title: string;
    explanation: string;
    evidence: string;
  }[];
}

export interface ValueAssessment {
  productId: string;
  pricePerformanceRatio: number;
  pricePerformanceRationale: string;
  relativeMarketValue: string;
  longTermValueFactors: string[];
  totalCostOwnership: {
    baseCost: number;
    additionalCosts: {
      item: string;
      cost: number;
    }[];
    totalCost: number;
  };
  priceHistory: {
    currentPrice: number;
    lowestPriceLastMonth?: number;
    lowestPriceLast6Months?: number;
    priceDecreasing: boolean;
    buyingAdvice: string;
  };
}

export interface UserPersona {
  personaType: string;
  description: string;
  recommendedProduct: string;
  reasoningDetail: string;
  idealFeatures: {
    feature: string;
    reason: string;
  }[];
  potentialConcerns: {
    concern: string;
    solution: string;
  }[];
  suggestedAccessories?: {
    name: string;
    reason: string;
  }[];
}

export interface ExpertVerdict {
  bestOverallValue: {
    productId: string;
    rationale: string;
  };
  bestTechnicalSpecs: {
    productId: string;
    rationale: string;
  };
  mostSatisfyingForMostUsers: {
    productId: string;
    rationale: string;
  };
  specializedScenarios: {
    scenario: string;
    recommendedProduct: string;
    explanation: string;
  }[];
  conclusion: string;
}

export interface ProductOverview {
  productId: string;
  name: string;
  overview: string;
  keySpecifications: {
    category: string;
    specs: {
      name: string;
      value: string;
    }[];
  }[];
  pricing: {
    currentPrice: number;
    currency: string;
    discount?: {
      originalPrice: number;
      percentOff: number;
    };
  };
  marketReception: {
    rating: number;
    reviewCount: number;
    sentimentSummary: string;
  };
}

export interface ProductAnalysisResponse {
  productOverviews: ProductOverview[];
  featureComparisons: FeatureComparison[];
  strengthsWeaknesses: ProductStrengthWeakness[];
  valueAssessments: ValueAssessment[];
  userPersonas: UserPersona[];
  expertVerdict: ExpertVerdict;
  analysisMetadata: {
    completenessLevel: number;
    generationDate: string;
    missingDataPoints: {
      productId: string;
      missingFields: string[];
    }[];
    inferencesMade: {
      description: string;
      confidence: "high" | "medium" | "low";
      reasoning: string;
    }[];
  };
}

/**
 * Analyze products using Claude AI based on user-selected features
 */
export const analyzeProductsWithClaude = async (
  products: any[],
  userSelectedFeatures: string[],
  category: string
): Promise<ProductAnalysisResponse | null> => {
  try {
    console.log(`Starting Claude product analysis for ${products.length} products in ${category} category`);
    console.log(`User-selected important features: ${userSelectedFeatures.join(', ')}`);
    
    // Validation
    if (!products || products.length < 2) {
      console.error('At least two products are required for analysis');
      return null;
    }

    if (!userSelectedFeatures || userSelectedFeatures.length === 0) {
      console.error('At least one feature is required for analysis');
      return null;
    }

    // Create a new Supabase Edge Function for this
    const { data, error } = await supabase.functions.invoke('product-comparison-analysis', {
      body: JSON.stringify({
        products,
        userSelectedFeatures,
        category
      }),
      options: {
        timeout: 600000 // 10-minute timeout (in milliseconds)
      }
    });

    if (error) {
      console.error('Error calling Claude product analysis:', error);
      return null;
    }

    if (!data) {
      console.error('Empty response from Claude product analysis');
      return null;
    }

    console.log('Received Claude product analysis response');
    
    // Validate to ensure the response has the expected structure
    if (!data.productOverviews || !Array.isArray(data.productOverviews)) {
      console.error('Invalid response format: missing product overviews array');
      return null;
    }

    return data as ProductAnalysisResponse;
  } catch (error) {
    console.error('Unexpected error in Claude product analysis:', error);
    return null;
  }
};

/**
 * Update a comparison with product analysis data
 */
export const updateComparisonWithProductAnalysis = async (
  comparisonId: string,
  analysisData: ProductAnalysisResponse
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
      console.error('Error updating comparison with product analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating comparison:', error);
    return false;
  }
};