
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getComparison } from "@/services/productService";
import { BatchComparisonAnalysis } from "@/services/analysis/comparisonAnalysisTypes";
import { generateAndSaveBatchAnalysis, getBatchAnalysis } from "@/services/analysis/generateBatchAnalysis";

export const useComparisonData = (comparisonId: string | undefined) => {
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [batchAnalysis, setBatchAnalysis] = useState<BatchComparisonAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const fetchComparisonData = async () => {
    if (!comparisonId) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getComparison(comparisonId);
      if (data) {
        console.log('Loaded comparison data:', data);
        setComparisonData(data);
        
        // Try to fetch existing batch analysis
        fetchBatchAnalysis(comparisonId, data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load comparison data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching comparison:", error);
      toast({
        title: "Error",
        description: "Failed to load comparison data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchAnalysis = async (comparisonId: string, comparisonData: any) => {
    try {
      // First try to get existing analysis
      const existingAnalysis = await getBatchAnalysis(comparisonId);
      
      if (existingAnalysis) {
        console.log('Loaded existing batch analysis');
        setBatchAnalysis(existingAnalysis);
      } else {
        // Generate new analysis if none exists
        console.log('No existing batch analysis found, generating new one');
        setAnalysisLoading(true);
        
        const newAnalysis = await generateAndSaveBatchAnalysis(
          comparisonData.products,
          comparisonData.category,
          comparisonId
        );
        
        if (newAnalysis) {
          setBatchAnalysis(newAnalysis);
          toast({
            title: "Analysis Complete",
            description: "Batch comparison analysis has been generated.",
          });
        }
      }
    } catch (error) {
      console.error("Error with batch analysis:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!comparisonData || !comparisonId) return;
    
    setAnalysisLoading(true);
    toast({
      title: "Generating Analysis",
      description: "This may take a moment...",
    });
    
    try {
      const newAnalysis = await generateAndSaveBatchAnalysis(
        comparisonData.products,
        comparisonData.category,
        comparisonId
      );
      
      if (newAnalysis) {
        setBatchAnalysis(newAnalysis);
        toast({
          title: "Analysis Complete",
          description: "Batch comparison analysis has been regenerated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate analysis.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate analysis.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [comparisonId]);

  // Helper function to check if analysis data is present
  const hasAnalysisData = (product: any) => {
    return product && 
           ((product.pros && product.pros.length > 0) || 
            (product.cons && product.cons.length > 0) || 
            (product.specs?.featureRatings && Object.keys(product.specs.featureRatings).length > 0) ||
            product.overview);
  };

  // Helper function to check if ANY products have analysis data
  const hasAnyAnalysisData = () => {
    if (!comparisonData || !comparisonData.products) return false;
    return comparisonData.products.some(hasAnalysisData);
  };

  return {
    comparisonData,
    loading,
    batchAnalysis,
    analysisLoading,
    hasAnyAnalysisData,
    handleGenerateAnalysis
  };
};
