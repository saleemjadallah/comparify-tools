
import { useState } from "react";
import { useComparisonGenerator } from "./comparison/comparisonGenerator";
import { useProductOperations } from "./comparison/productOperations";
import { useFeatureOperations } from "./comparison/featureOperations";
import { useNavigationOperations } from "./comparison/navigationOperations";
import { ComparisonState } from "./comparison/types";

export function useComparisonBuilder() {
  // Initialize state
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([
    { name: "", id: "1" },
    { name: "", id: "2" },
  ]);
  const [featureImportance, setFeatureImportance] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Create state object
  const state: ComparisonState = {
    category,
    products,
    featureImportance,
    currentStep,
    isGenerating: false,
  };

  // Initialize hooks for different operations
  const { isGenerating, generateComparison } = useComparisonGenerator(state);
  
  const { 
    addProduct, 
    removeProduct, 
    updateProductName, 
    selectProduct 
  } = useProductOperations(products, setProducts);
  
  const { toggleFeature } = useFeatureOperations(featureImportance, setFeatureImportance);
  
  const navigation = useNavigationOperations(
    { ...state, isGenerating }, 
    generateComparison
  );

  return {
    // State
    category,
    setCategory,
    products,
    featureImportance,
    currentStep: navigation.currentStep,
    setCurrentStep: navigation.setCurrentStep,
    isGenerating,
    
    // Product operations
    addProduct,
    removeProduct,
    updateProductName,
    selectProduct,
    
    // Feature operations
    toggleFeature,
    
    // Navigation
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep
  };
}
