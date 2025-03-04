
// Types for the structured multi-product batch comparison analysis

// Comparative Overview
export interface ComparativeOverviewItem {
  productId: string;
  productName: string;
  model?: string;
  currentPrice: number;
  discount?: {
    originalPrice: number;
    percentOff: number;
  };
  rating?: number;
  reviewCount?: number;
  keyFeatures: string[];
  releaseDate?: string;
  quickVerdict: string;
}

export interface ComparativeOverview {
  items: ComparativeOverviewItem[];
}

// Specification Parity Analysis
export interface SpecificationItem {
  name: string;
  values: {
    [productId: string]: {
      value: string;
      isSuperior: boolean;
      isMissing?: boolean;
      isMarketing?: boolean;
    };
  };
  explanation?: string;
}

export interface SpecificationCategory {
  name: string;
  specifications: SpecificationItem[];
}

export interface SpecificationParity {
  categories: SpecificationCategory[];
}

// Feature Presence Matrix
export interface FeaturePresence {
  featureName: string;
  isStandard: boolean;
  isPremium: boolean;
  isUnique: boolean;
  presence: {
    [productId: string]: {
      present: boolean;
      qualityRating?: number; // 1-5 scale
    };
  };
}

export interface FeatureMatrix {
  features: FeaturePresence[];
}

// Price-Value Assessment
export interface PriceValueMetric {
  name: string;
  values: {
    [productId: string]: {
      value: number | string;
      rating: number; // 1-5 scale
    };
  };
}

export interface PriceValueAssessment {
  metrics: PriceValueMetric[];
  costPerUnit?: {
    unitName: string;
    values: {
      [productId: string]: number;
    };
  }[];
  totalOwnershipCost: {
    [productId: string]: {
      basePrice: number;
      accessories: number;
      subscriptions?: number;
      total: number;
    };
  };
  valueLongevity: {
    [productId: string]: {
      rating: number; // 1-5 scale
      explanation: string;
    };
  };
  warranty: {
    [productId: string]: {
      coverage: string;
      durationMonths: number;
      quality: number; // 1-5 scale
    };
  };
}

// User Experience Comparison
export interface UserExperienceAspect {
  name: string;
  values: {
    [productId: string]: {
      satisfactionLevel: number; // 1-5 scale
      commonComplaints?: string[];
      positiveHighlights?: string[];
    };
  };
}

export interface UserExperienceComparison {
  aspects: UserExperienceAspect[];
  reliabilityIssues: {
    [productId: string]: string[];
  };
  customerServiceRating: {
    [productId: string]: number; // 1-5 scale
  };
}

// Use-Case Optimization
export interface UseCase {
  name: string;
  bestProductId: string;
  reasoning: string;
  secondBestProductId?: string;
}

export interface UseCaseOptimization {
  useCases: UseCase[];
  idealPersonas: {
    [productId: string]: string;
  };
  dealBreakers: {
    [productId: string]: string[];
  };
}

// Comparison Results
export interface CategoryWinner {
  categoryName: string;
  winnerId: string;
  reasoning: string;
  advantageSignificance: number; // 1-5 scale
  relevanceToMostUsers: number; // 1-5 scale
}

export interface PersonalizedRecommendation {
  recommendationType: string; // e.g., "Best for budget", "Best overall"
  productId: string;
  reasoning: string;
}

export interface ConfidenceAssessment {
  dataCompletenessRating: number; // 1-5 scale
  incomparableSpecifications?: string[];
  claimContradictions?: {
    productId: string;
    claim: string;
    contradiction: string;
  }[];
  needsHandsOnTesting?: string[];
  additionalResearchRecommended?: string[];
}

// The complete batch comparison analysis
export interface BatchComparisonAnalysis {
  id?: string;
  createdAt?: string;
  comparativeOverview: ComparativeOverview;
  specificationParity: SpecificationParity;
  featureMatrix: FeatureMatrix;
  priceValueAssessment: PriceValueAssessment;
  userExperienceComparison: UserExperienceComparison;
  useCaseOptimization: UseCaseOptimization;
  topLineSummary: string;
  categoryWinners: CategoryWinner[];
  personalizedRecommendations: PersonalizedRecommendation[];
  confidenceAssessment: ConfidenceAssessment;
  productIds: string[];
}
