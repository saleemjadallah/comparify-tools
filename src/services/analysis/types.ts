
// Define types for Claude AI analysis 

// Interface for feature ratings
export interface FeatureRating {
  rating: number;
  explanation: string;
  confidence?: 'high' | 'medium' | 'low';
}

// Interface for product analysis
export interface ProductAnalysis {
  name: string;
  overview: string;
  pros: string[];
  cons: string[];
  featureRatings: Record<string, FeatureRating>;
}

// Interface for personalized recommendations
export interface PersonalizedRecommendation {
  productId: string;
  recommendationType: string;
  reasoning: string;
  standoutFeatures: string[];
  relevantTradeoffs: string;
  recommendedAccessory: string;
}

// Interface for data completeness information
export interface DataCompleteness {
  overallCompleteness: string;
  missingKeyData: string[];
  inferredData: string[];
}

// Interface for the complete analysis response
export interface AnalysisResponse {
  products: ProductAnalysis[];
  personalizedRecommendations?: PersonalizedRecommendation[];
  dataCompleteness?: DataCompleteness;
}
