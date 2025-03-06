import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ComparisonState, Product } from "./types";
import { saveProduct, saveComparison } from "@/services/productService";
import { directAnalyzeProducts, updateComparisonWithAnalysis } from "@/services/claudeAnalysisService";
import { useValidation } from "./validationUtils";

export const useComparisonGenerator = (state: ComparisonState) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateCurrentStep } = useValidation();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate the comparison
  const generateComparison = async () => {
    if (!validateCurrentStep(state)) return;
    
    // Set loading state
    setIsGenerating(true);
    
    try {
      // Save products to database
      const productIds = await Promise.all(
        state.products.map(async (product: Product) => {
          // Skip if no details
          if (!product.details) {
            return null;
          }
          
          // Save product to database
          const productId = await saveProduct(product.details, state.category);
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
      const comparisonId = await saveComparison(state.category, validProductIds, state.featureImportance);
      
      if (!comparisonId) {
        throw new Error("Failed to create comparison");
      }

      // Use Claude AI to analyze the products based on user preferences
      toast({
        title: "Analyzing products",
        description: "This may take a few minutes as our AI performs a detailed analysis based on your preferences...",
        duration: 15000, // Show for 15 seconds
      });

      const productDetails = state.products
        .filter(p => p.details)
        .map(p => p.details);

      if (productDetails.length >= 2) {
        // Direct analysis with Claude
        const analysisResults = await directAnalyzeProducts(
          productDetails,
          state.featureImportance,
          state.category
        );

        if (analysisResults) {
          // Update the comparison with AI analysis
          await updateComparisonWithAnalysis(comparisonId, analysisResults);

          toast({
            title: "Analysis complete",
            description: "Product analysis has been added to your comparison.",
          });
        } else {
          toast({
            title: "Analysis incomplete",
            description: "Analysis could not be completed, but your comparison has been saved.",
            variant: "warning",
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

  return {
    isGenerating,
    generateComparison
  };
};