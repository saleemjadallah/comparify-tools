
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComparativeOverview as ComparativeOverviewType } from '@/services/analysis/comparisonAnalysisTypes';

interface ComparativeOverviewProps {
  overview: ComparativeOverviewType;
}

const ComparativeOverview = ({ overview }: ComparativeOverviewProps) => {
  if (!overview || !overview.items || overview.items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {overview.items.map((item) => (
        <Card key={item.productId} className="h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold leading-tight">
                {item.productName}
              </CardTitle>
              <Badge className="ml-2" variant={getVerdictVariant(item.quickVerdict)}>
                {item.quickVerdict}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {item.model && <div>{item.model}</div>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${item.currentPrice.toFixed(2)}</span>
              </div>
              
              {item.rating && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">
                    {item.rating}/5
                    {item.reviewCount && ` (${item.reviewCount} reviews)`}
                  </span>
                </div>
              )}
              
              <div>
                <div className="text-muted-foreground mb-1">Key Features</div>
                <ul className="space-y-1 text-sm">
                  {item.keyFeatures.map((feature, index) => (
                    <li key={index} className="pl-4 relative">
                      <span className="absolute left-0 top-2 w-2 h-2 bg-primary rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {item.releaseDate && (
                <div className="flex justify-between pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Released</span>
                  <span>{formatDate(item.releaseDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to determine badge variant based on verdict
const getVerdictVariant = (verdict: string): "default" | "secondary" | "destructive" | "outline" => {
  const lowerVerdict = verdict.toLowerCase();
  
  if (lowerVerdict.includes('excellent') || lowerVerdict.includes('premium')) {
    return 'default';
  } else if (lowerVerdict.includes('good') || lowerVerdict.includes('mid')) {
    return 'secondary';
  } else if (lowerVerdict.includes('average') || lowerVerdict.includes('budget')) {
    return 'outline';
  } else if (lowerVerdict.includes('poor') || lowerVerdict.includes('entry')) {
    return 'destructive';
  }
  
  return 'secondary';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  } catch (e) {
    return dateString;
  }
};

export default ComparativeOverview;
