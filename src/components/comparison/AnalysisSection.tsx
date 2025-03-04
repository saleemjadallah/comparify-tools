
import React from "react";
import { Button } from "@/components/ui/button";
import { BatchComparisonAnalysis } from "@/services/analysis/comparisonAnalysisTypes";
import BatchComparisonAnalysisComponent from "@/components/comparison/BatchComparisonAnalysis";
import AnalysisStatusAlert from "@/components/comparison/AnalysisStatusAlert";

interface AnalysisSectionProps {
  batchAnalysis: BatchComparisonAnalysis | null;
  products: any[];
  hasAnyAnalysisData: boolean;
  isLoading: boolean;
  onGenerateAnalysis: () => void;
}

const AnalysisSection = ({
  batchAnalysis,
  products,
  hasAnyAnalysisData,
  isLoading,
  onGenerateAnalysis
}: AnalysisSectionProps) => {
  if (!hasAnyAnalysisData && !batchAnalysis) {
    return <AnalysisStatusAlert onRetry={onGenerateAnalysis} />;
  }

  if (!batchAnalysis) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Comprehensive Analysis</h2>
        <Button 
          variant="outline" 
          onClick={onGenerateAnalysis}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Regenerate Analysis"}
        </Button>
      </div>
      <BatchComparisonAnalysisComponent 
        analysis={batchAnalysis} 
        products={products} 
      />
    </div>
  );
};

export default AnalysisSection;
