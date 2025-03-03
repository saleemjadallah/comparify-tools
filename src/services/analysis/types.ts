
// Define types for Claude AI analysis 

// Interface for feature ratings
export interface FeatureRating {
  rating: number;
  explanation: string;
}

// Interface for product analysis
export interface ProductAnalysis {
  name: string;
  overview: string;
  pros: string[];
  cons: string[];
  featureRatings: Record<string, FeatureRating>;
}

// Interface for the complete analysis response
export interface AnalysisResponse {
  products: ProductAnalysis[];
}
