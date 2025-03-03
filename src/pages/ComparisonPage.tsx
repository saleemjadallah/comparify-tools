
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getComparison } from "@/services/productService";

// Import our new components
import ComparisonHeader from "@/components/comparison/ComparisonHeader";
import ComparisonSkeleton from "@/components/comparison/ComparisonSkeleton";
import ComparisonNotFound from "@/components/comparison/ComparisonNotFound";
import AnalysisStatusAlert from "@/components/comparison/AnalysisStatusAlert";
import ProductOverviewSection from "@/components/comparison/ProductOverviewSection";
import KeyFeaturesSection from "@/components/comparison/KeyFeaturesSection";
import SpecificationsSection from "@/components/comparison/SpecificationsSection";

const ComparisonPage = () => {
  const { comparisonId } = useParams();
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

  const handleRetryAnalysis = () => {
    window.location.reload();
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
        {!hasAnyAnalysisData() && (
          <AnalysisStatusAlert onRetry={handleRetryAnalysis} />
        )}

        {/* Product Overview Section */}
        <ProductOverviewSection products={comparisonData.products} />

        {/* Key Features Section */}
        <KeyFeaturesSection 
          featureImportance={comparisonData.featureImportance}
          products={comparisonData.products}
        />

        {/* Specifications Table */}
        <SpecificationsSection products={comparisonData.products} />
      </div>
    </div>
  );
};

export default ComparisonPage;
