import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getComparison } from "@/services/productService";

export const useComparisonData = (comparisonId: string | undefined) => {
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchComparisonData();
  }, [comparisonId]);

  return {
    comparisonData,
    loading
  };
};