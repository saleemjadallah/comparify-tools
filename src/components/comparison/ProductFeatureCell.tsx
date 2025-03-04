
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { truncateText, getConfidenceColor } from './utils/featureUtils';
import { findFeatureRating } from './utils/featureMatching';
import { mockFeatureData } from './utils/mockFeatureData';
import FeatureRatingBar from './FeatureRatingBar';

interface ProductFeatureCellProps {
  product: any;
  feature: string;
}

const ProductFeatureCell = ({ product, feature }: ProductFeatureCellProps) => {
  // Find the feature rating using our utility function
  const aiRating = findFeatureRating(product, feature);
  
  // Get mock data as fallback
  const mockProductData = mockFeatureData[feature]?.[product.name];
  
  // Use AI-generated rating if available, otherwise fall back to mock data
  const featureData = aiRating ? {
    rating: aiRating.rating,
    description: aiRating.explanation,
    confidence: aiRating.confidence || "medium"
  } : mockProductData ? {
    ...mockProductData,
    confidence: "medium"
  } : null;
  
  // If no data is available at all
  if (!featureData) {
    console.log(`No feature data available for "${feature}" in ${product.name}`);
    return (
      <div className="p-6">
        <div className="font-medium mb-2">{truncateText(product.name, 20)}</div>
        <div className="text-muted-foreground text-sm">No data available</div>
      </div>
    );
  }
  
  console.log(`Feature "${feature}" for ${product.name}:`, { aiRating, featureData });
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{truncateText(product.name, 20)}</div>
        <div className="flex items-center">
          <span className="font-semibold mr-1">{featureData.rating}</span>
          <span className="text-sm text-muted-foreground">/10</span>
          {featureData.confidence && (
            <Badge variant="outline" className={cn("ml-2 text-xs", getConfidenceColor(featureData.confidence))}>
              {featureData.confidence}
            </Badge>
          )}
        </div>
      </div>
      
      <FeatureRatingBar rating={featureData.rating} />
      
      <p className="text-sm text-muted-foreground">
        {featureData.description}
      </p>
    </div>
  );
};

export default ProductFeatureCell;
