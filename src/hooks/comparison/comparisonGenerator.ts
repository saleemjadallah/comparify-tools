import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ComparisonState, Product } from "./types";
import { saveProduct, saveComparison } from "@/services/productService";
import { analyzeProductsWithClaude, updateComparisonWithProductAnalysis } from "@/services/claudeProductAnalysisService";
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

      // Show initial toast
      toast({
        title: "Comparison created",
        description: "Now analyzing products based on your preferences...",
        duration: 5000,
      });

      // Get product details for analysis
      const productDetails = state.products
        .filter(p => p.details)
        .map(p => p.details);

      // Start a background process to analyze the products
      if (productDetails.length >= 2) {
        try {
          // Show detailed toast for longer analysis
          toast({
            title: "AI analysis in progress",
            description: "Our AI is performing a comprehensive analysis of your selected products. This may take a few minutes...",
            duration: 10000,
          });

          // Analyze products with Claude
          const analysisResults = await analyzeProductsWithClaude(
            productDetails,
            state.featureImportance,
            state.category
          );

          if (analysisResults) {
            // Update the comparison with analysis results
            await updateComparisonWithProductAnalysis(comparisonId, analysisResults);

            toast({
              title: "Analysis complete",
              description: "Your product comparison has been enriched with AI-powered insights.",
              duration: 5000,
            });
          }
        } catch (analysisError) {
          console.error("Error during product analysis:", analysisError);
          toast({
            title: "Analysis incomplete",
            description: "We couldn't complete the full analysis, but you can still view the basic comparison.",
            variant: "warning",
            duration: 5000,
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