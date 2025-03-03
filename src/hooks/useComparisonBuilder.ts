import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { saveProduct, saveComparison } from "@/services/productService";
import { analyzeProducts, updateComparisonWithAnalysis } from "@/services/claudeAnalysisService";

export function useComparisonBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Array<{ name: string; id: string; details?: any }>>([
    { name: "", id: "1" },
    { name: "", id: "2" },
  ]);
  const [featureImportance, setFeatureImportance] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add a new product
  const addProduct = () => {
    if (products.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can compare up to 5 products at a time.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts([...products, { name: "", id: crypto.randomUUID() }]);
  };

  // Remove a product
  const removeProduct = (id: string) => {
    if (products.length <= 2) {
      toast({
        title: "Minimum requirement",
        description: "You need at least 2 products to compare.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts(products.filter(product => product.id !== id));
  };

  // Update product name
  const updateProductName = (id: string, name: string) => {
    setProducts(
      products.map(product => 
        product.id === id ? { ...product, name } : product
      )
    );
  };

  // Select product from search results
  const selectProduct = (product: any, productIndex: number) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      id: updatedProducts[productIndex].id,
      name: product.name,
      details: product
    };
    
    setProducts(updatedProducts);
  };

  // Toggle feature importance
  const toggleFeature = (feature: string) => {
    setFeatureImportance(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    if (currentStep === 0 && !category) {
      toast({
        title: "Please select a category",
        description: "You need to select a product category before continuing.",
        variant: "destructive",
      });
      return false;
    }
    
    if (currentStep === 1 && products.some(p => !p.name)) {
      toast({
        title: "Missing product names",
        description: "Please fill in all product names before continuing.",
        variant: "destructive",
      });
      return false;
    }
    
    if (currentStep === 2 && featureImportance.length === 0) {
      toast({
        title: "No features selected",
        description: "Please select at least one feature for comparison.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Generate the comparison
  const generateComparison = async () => {
    if (!validateCurrentStep()) return;
    
    // Set loading state
    setIsGenerating(true);
    
    try {
      // Save products to database
      const productIds = await Promise.all(
        products.map(async product => {
          // Skip if no details
          if (!product.details) {
            return null;
          }
          
          // Save product to database
          const productId = await saveProduct(product.details, category);
          if (!productId) {
            throw new Error(`Failed to save product: ${product.name}`);
          }
          
          return productId;
        })
      );
      
      // Filter out null entries
      const validProductIds = productIds.filter(Boolean) as string[];
      
      if (validProductIds.length < 2) {
        throw new Error("Not enough valid products to create a comparison");
      }
      
      // Save comparison to database
      const comparisonId = await saveComparison(category, validProductIds, featureImportance);
      
      if (!comparisonId) {
        throw new Error("Failed to create comparison");
      }

      // Run Claude AI analysis on the products
      toast({
        title: "Analyzing products",
        description: "Using AI to analyze your selected products...",
      });

      const productDetails = products
        .filter(p => p.details)
        .map(p => p.details);

      if (productDetails.length >= 2) {
        const analysisResults = await analyzeProducts(
          productDetails,
          featureImportance,
          category
        );

        if (analysisResults) {
          // Update the comparison with AI analysis
          await updateComparisonWithAnalysis(comparisonId, analysisResults);

          toast({
            title: "Analysis complete",
            description: "Product analysis has been added to your comparison.",
          });
        }
      }
      
      // Navigate to comparison page
      navigate(`/compare/${comparisonId}`);
    } catch (error) {
      console.error("Error generating comparison:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem generating your comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setIsGenerating(false);
    }
  };

  // Navigate to next step
  const nextStep = async () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateComparison();
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    category,
    setCategory,
    products,
    featureImportance,
    currentStep,
    setCurrentStep,
    isGenerating,
    addProduct,
    removeProduct,
    updateProductName,
    selectProduct,
    toggleFeature,
    nextStep,
    prevStep
  };
}
