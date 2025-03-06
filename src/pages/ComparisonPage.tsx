import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparisonData } from "@/hooks/useComparisonData";

// Import our components
import ComparisonHeader from "@/components/comparison/ComparisonHeader";
import ComparisonSkeleton from "@/components/comparison/ComparisonSkeleton";
import ComparisonNotFound from "@/components/comparison/ComparisonNotFound";
import ProductOverviewSection from "@/components/comparison/ProductOverviewSection";
import KeyFeaturesSection from "@/components/comparison/KeyFeaturesSection";
import SpecificationsSection from "@/components/comparison/SpecificationsSection";
import AnalysisSection from "@/components/comparison/AnalysisSection";

const ComparisonPage = () => {
  const { comparisonId } = useParams();
  const {
    comparisonData,
    loading,
    analysisLoading,
    analysisResults
  } = useComparisonData(comparisonId);

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

        {/* AI Analysis Section */}
        <AnalysisSection 
          analysisResults={analysisResults}
          isLoading={analysisLoading}
        />

        {/* Original Sections */}
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