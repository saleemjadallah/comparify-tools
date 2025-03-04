
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getComparison } from "@/services/productService";
import { BatchComparisonAnalysis as BatchAnalysisType } from "@/services/analysis/comparisonAnalysisTypes";
import { generateAndSaveBatchAnalysis, getBatchAnalysis } from "@/services/analysis/generateBatchAnalysis";

// Import our components
import ComparisonHeader from "@/components/comparison/ComparisonHeader";
import ComparisonSkeleton from "@/components/comparison/ComparisonSkeleton";
import ComparisonNotFound from "@/components/comparison/ComparisonNotFound";
import AnalysisStatusAlert from "@/components/comparison/AnalysisStatusAlert";
import ProductOverviewSection from "@/components/comparison/ProductOverviewSection";
import KeyFeaturesSection from "@/components/comparison/KeyFeaturesSection";
import SpecificationsSection from "@/components/comparison/SpecificationsSection";
import BatchComparisonAnalysisComponent from "@/components/comparison/BatchComparisonAnalysis";

const ComparisonPage = () => {
  const { comparisonId } = useParams();
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [batchAnalysis, setBatchAnalysis] = useState<BatchAnalysisType | null>(null);
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
  }, [comparisonId, toast]);

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

  if (loading) {
    return <ComparisonSkeleton />;
  }

  if (!comparisonData) {
    return <ComparisonNotFound />;
  }

  return (
    <div className="min-h-[calc(100vh-theme(space.20))] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/compare">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Comparison Builder
            </Link>
          </Button>
          
          <ComparisonHeader 
            category={comparisonData.category} 
            products={comparisonData.products}
            comparisonId={comparisonId || ""}
          />
        </div>

        {/* Analysis Status */}
        {!hasAnyAnalysisData() && !batchAnalysis && (
          <AnalysisStatusAlert onRetry={handleGenerateAnalysis} />
        )}

        {/* Batch Comparison Analysis (new) */}
        {batchAnalysis && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Comprehensive Analysis</h2>
              <Button 
                variant="outline" 
                onClick={handleGenerateAnalysis}
                disabled={analysisLoading}
              >
                {analysisLoading ? "Generating..." : "Regenerate Analysis"}
              </Button>
            </div>
            <BatchComparisonAnalysisComponent 
              analysis={batchAnalysis} 
              products={comparisonData.products} 
            />
          </div>
        )}

        {/* Original Sections (kept for backward compatibility) */}
        <ProductOverviewSection products={comparisonData.products} />

        <KeyFeaturesSection 
          featureImportance={comparisonData.featureImportance}
          products={comparisonData.products}
        />

        <SpecificationsSection products={comparisonData.products} />
      </div>
    </div>
  );
};

export default ComparisonPage;
