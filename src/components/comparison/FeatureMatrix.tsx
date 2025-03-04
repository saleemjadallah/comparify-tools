
import React from 'react';
import { Check, X } from 'lucide-react';
import { FeatureMatrix as FeatureMatrixType } from '@/services/analysis/comparisonAnalysisTypes';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeatureMatrixProps {
  featureMatrix: FeatureMatrixType;
  productIds: string[];
  productNames: string[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const FeatureMatrix = ({ 
  featureMatrix, 
  productIds,
  productNames 
}: FeatureMatrixProps) => {
  if (!featureMatrix || !featureMatrix.features || featureMatrix.features.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No feature data available for comparison.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-medium text-muted-foreground">
                Feature
              </th>
              {productNames.map((name, index) => (
                <th key={index} className="py-4 px-6 text-center font-semibold">
                  {truncateText(name, 15)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureMatrix.features.map((feature, index) => (
              <tr key={feature.featureName} className={cn(index !== featureMatrix.features.length - 1 && "border-b")}>
                <td className="py-4 px-6 font-medium">
                  <div className="flex items-center">
                    {feature.featureName}
                    {feature.isPremium && (
                      <Badge variant="default" className="ml-2">Premium</Badge>
                    )}
                    {feature.isUnique && (
                      <Badge variant="outline" className="ml-2">Unique</Badge>
                    )}
                  </div>
                </td>
                {productIds.map(productId => {
                  const presence = feature.presence[productId];
                  
                  if (!presence) {
                    return (
                      <td key={productId} className="py-4 px-6 text-center">
                        <X className="inline-block text-red-500" size={18} />
                      </td>
                    );
                  }
                  
                  return (
                    <td key={productId} className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        {presence.present ? (
                          <Check className="text-green-500" size={18} />
                        ) : (
                          <X className="text-red-500" size={18} />
                        )}
                        
                        {presence.present && presence.qualityRating && (
                          <div 
                            className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: getRatingColor(presence.qualityRating),
                              color: getTextColor(presence.qualityRating)
                            }}
                          >
                            {presence.qualityRating}/5
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper functions for colors
const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#10b981'; // Green for excellent
  if (rating >= 3.5) return '#60a5fa'; // Blue for good
  if (rating >= 2.5) return '#fbbf24'; // Amber for average
  return '#f87171'; // Red for poor
};

const getTextColor = (rating: number): string => {
  if (rating >= 3.5) return 'white'; // White text for darker backgrounds
  return 'black'; // Black text for lighter backgrounds
};

export default FeatureMatrix;
