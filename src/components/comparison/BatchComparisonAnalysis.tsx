
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BatchComparisonAnalysis as BatchComparisonAnalysisType } from '@/services/analysis/comparisonAnalysisTypes';
import SectionContainer from "@/components/comparison/SectionContainer";
import ComparativeOverview from "@/components/comparison/ComparativeOverview";
import SpecificationParityTable from "@/components/comparison/SpecificationParityTable";
import FeatureMatrix from "@/components/comparison/FeatureMatrix";

interface BatchComparisonAnalysisProps {
  analysis: BatchComparisonAnalysisType;
  products: any[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Helper function to format recommendation reasoning
const formatRecommendation = (reasoning: string, productName: string): string => {
  // Replace direct mentions of the product with "This option"
  const genericReasoning = reasoning
    .replace(new RegExp(productName, 'gi'), "This option")
    .replace(/This product/gi, "This option")
    .replace(/The product/gi, "This option");
  
  // Add a summarizing first sentence if it doesn't already have one
  if (!genericReasoning.match(/^(This option|It) (is|offers|provides|delivers|features)/i)) {
    return `This option stands out because ${genericReasoning.charAt(0).toLowerCase() + genericReasoning.slice(1)}`;
  }
  
  return genericReasoning;
};

const BatchComparisonAnalysis = ({ 
  analysis, 
  products 
}: BatchComparisonAnalysisProps) => {
  if (!analysis) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <p className="text-muted-foreground">No analysis data available yet.</p>
      </div>
    );
  }

  // Extract product IDs and names for components
  const productIds = products.map(product => product.id);
  const productNames = products.map(product => truncateText(product.name, 15));
  
  return (
    <div className="space-y-8">
      {/* Top-line Summary */}
      <div className="bg-muted rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
        <p className="text-muted-foreground">{analysis.topLineSummary}</p>
      </div>
      
      {/* Comparative Overview */}
      <SectionContainer title="Comparative Overview">
        <ComparativeOverview overview={analysis.comparativeOverview} />
      </SectionContainer>
      
      {/* Category Winners */}
      <SectionContainer title="Category Winners">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysis.categoryWinners.map((winner) => {
            const winningProduct = products.find(p => p.id === winner.winnerId);
            if (!winningProduct) return null;
            
            return (
              <div key={winner.categoryName} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{winner.categoryName}</h3>
                  <Badge>{winner.advantageSignificance}/5</Badge>
                </div>
                <div className="text-lg font-medium mb-2">
                  {truncateText(winningProduct.name, 20)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {winner.reasoning}
                </p>
                <div className="text-xs text-muted-foreground flex items-center">
                  <span>Relevance to most users:</span>
                  <span className="ml-2 font-medium">{winner.relevanceToMostUsers}/5</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionContainer>
      
      {/* Specifications */}
      <SectionContainer title="Specification Comparison">
        <SpecificationParityTable 
          specificationParity={analysis.specificationParity}
          productIds={productIds}
          productNames={productNames}
        />
      </SectionContainer>
      
      {/* Feature Matrix */}
      <SectionContainer title="Feature Presence Matrix">
        <p className="text-muted-foreground mb-4">
          Compare which features are present across all products and their quality rating when applicable.
        </p>
        <FeatureMatrix 
          featureMatrix={analysis.featureMatrix}
          productIds={productIds}
          productNames={productNames}
        />
      </SectionContainer>
      
      {/* Personalized Recommendations */}
      <SectionContainer title="Personalized Recommendations">
        <div className="space-y-4">
          {analysis.personalizedRecommendations.map((recommendation) => {
            const recommendedProduct = products.find(p => p.id === recommendation.productId);
            if (!recommendedProduct) return null;
            
            const formattedReasoning = formatRecommendation(recommendation.reasoning, recommendedProduct.name);
            
            return (
              <div key={recommendation.recommendationType} className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {recommendation.recommendationType}
                </h3>
                <div className="flex items-center mb-3">
                  <Badge variant="outline" className="mr-2">Recommended</Badge>
                  <span className="font-medium">{truncateText(recommendedProduct.name, 20)}</span>
                </div>
                <p className="text-muted-foreground">{formattedReasoning}</p>
              </div>
            );
          })}
        </div>
      </SectionContainer>
      
      {/* Confidence Assessment */}
      <SectionContainer title="Analysis Confidence">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Data Completeness Rating</h3>
            <div className="flex items-center">
              <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(analysis.confidenceAssessment.dataCompletenessRating / 5) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 font-medium">
                {analysis.confidenceAssessment.dataCompletenessRating}/5
              </span>
            </div>
          </div>
          
          {analysis.confidenceAssessment.incomparableSpecifications && analysis.confidenceAssessment.incomparableSpecifications.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Specifications that couldn't be directly compared:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {analysis.confidenceAssessment.incomparableSpecifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.confidenceAssessment.needsHandsOnTesting && analysis.confidenceAssessment.needsHandsOnTesting.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Aspects requiring hands-on testing:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {analysis.confidenceAssessment.needsHandsOnTesting.map((aspect, index) => (
                  <li key={index}>{aspect}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.confidenceAssessment.additionalResearchRecommended && analysis.confidenceAssessment.additionalResearchRecommended.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recommended additional research:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {analysis.confidenceAssessment.additionalResearchRecommended.map((research, index) => (
                  <li key={index}>{research}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionContainer>
    </div>
  );
};

export default BatchComparisonAnalysis;
