
export interface Product {
  name: string;
  id: string;
  details?: any;
}

export interface ComparisonState {
  category: string;
  products: Product[];
  featureImportance: string[];
  currentStep: number;
  isGenerating: boolean;
}
