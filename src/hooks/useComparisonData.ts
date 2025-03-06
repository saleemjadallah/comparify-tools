import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getComparison } from "@/services/productService";
import { ProductAnalysisResponse } from "@/services/claudeProductAnalysisService";

export const useComparisonData = (comparisonId: string | undefined) => {
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<ProductAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const fetchComparisonData = async () => {
    if (!comparisonId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await getComparison(comparisonId);
      
      if (data) {
        console.log('Loaded comparison data:', data);
        setComparisonData(data);
        
        // Check if the comparison has AI analysis
        if (data.ai_analysis) {
          console.log('Found AI analysis data');
          setAnalysisLoading(true);
          
          try {
            // Short timeout to allow the UI to update and show loading state
            setTimeout(() => {
              setAnalysisResults(data.ai_analysis);
              setAnalysisLoading(false);
            }, 500);
          } catch (analysisError) {
            console.error('Error processing analysis data:', analysisError);
            setAnalysisLoading(false);
          }
        } else {
          console.log('No AI analysis data found for this comparison');
          setAnalysisResults(null);
        }
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

  // Force refresh the data
  const refreshData = () => {
    if (comparisonId) {
      fetchComparisonData();
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [comparisonId]);

  return {
    comparisonData,
    loading,
    analysisResults,
    analysisLoading,
    refreshData
  };
};