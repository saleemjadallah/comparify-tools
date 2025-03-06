
/**
 * Types for product comparison analysis features
 */

export interface ComparativeOverview {
  items: {
    productId: string;
    productName: string;
    model?: string;
    currentPrice: number;
    rating?: number;
    reviewCount?: number;
    keyFeatures: string[];
    releaseDate?: string;
    quickVerdict: string;
  }[];
}

export interface FeatureMatrix {
  features: {
    featureName: string;
    description?: string;
    isPremium: boolean;
    isUnique: boolean;
    presence: Record<string, {
      present: boolean;
      qualityRating?: number;
      notes?: string;
    }>;
  }[];
}

export interface SpecificationParity {
  categories: {
    name: string;
    specifications: {
      name: string;
      explanation?: string;
      values: Record<string, {
        value: string;
        isSuperior?: boolean;
        isMarketing?: boolean;
        isMissing?: boolean;
      }>;
    }[];
  }[];
}

/**
 * Other analysis-related types that might be needed
 */

export interface ProductAnalysisResult {
  comparativeOverview: ComparativeOverview;
  featureMatrix: FeatureMatrix;
  specificationParity: SpecificationParity;
  // Add other analysis sections as needed
}
