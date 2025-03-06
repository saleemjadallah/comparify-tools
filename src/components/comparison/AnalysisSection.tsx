import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import SectionContainer from './SectionContainer';
import {
  ProductAnalysisResponse,
  FeatureComparison,
  ProductOverview,
  UserPersona,
  ExpertVerdict
} from '@/services/claudeProductAnalysisService';

interface AnalysisSectionProps {
  analysisResults: ProductAnalysisResponse | null;
  isLoading: boolean;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ 
  analysisResults, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <SectionContainer>
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>Comprehensive AI-powered product comparison</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analyzing your selected products...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Our AI is thoroughly comparing your products based on the features that matter to you.
              This may take a few minutes.
            </p>
          </CardContent>
        </Card>
      </SectionContainer>
    );
  }

  if (!analysisResults) {
    return (
      <SectionContainer>
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis not available</AlertTitle>
          <AlertDescription>
            We couldn't generate an AI analysis for these products. You can still review the basic
            comparison details below.
          </AlertDescription>
        </Alert>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <Tabs defaultValue="overview" className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">AI-Powered Analysis</CardTitle>
              <CardDescription>Comprehensive comparison based on your preferences</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              AI Analysis Complete
            </Badge>
          </div>
          <TabsList className="mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Comparison</TabsTrigger>
            <TabsTrigger value="personas">Best For You</TabsTrigger>
            <TabsTrigger value="verdict">Expert Verdict</TabsTrigger>
          </TabsList>
        </CardHeader>
        
        <CardContent className="pt-4">
          <TabsContent value="overview" className="mt-0">
            <ProductOverviews productOverviews={analysisResults.productOverviews} />
          </TabsContent>
          
          <TabsContent value="features" className="mt-0">
            <FeatureComparisons featureComparisons={analysisResults.featureComparisons} />
          </TabsContent>
          
          <TabsContent value="personas" className="mt-0">
            <UserPersonas userPersonas={analysisResults.userPersonas} />
          </TabsContent>
          
          <TabsContent value="verdict" className="mt-0">
            <ExpertVerdictSection expertVerdict={analysisResults.expertVerdict} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </SectionContainer>
  );
};

// Product Overviews Component
const ProductOverviews: React.FC<{ productOverviews: ProductOverview[] }> = ({ productOverviews }) => {
  return (
    <div className="space-y-6">
      {productOverviews.map((product, index) => (
        <Card key={product.productId || index} className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4">{product.overview}</p>
            
            <div className="space-y-4">
              {product.keySpecifications.map((category, cIndex) => (
                <div key={cIndex}>
                  <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.specs.map((spec, sIndex) => (
                      <div key={sIndex} className="flex items-start">
                        <div className="text-xs text-muted-foreground mr-2">{spec.name}:</div>
                        <div className="text-xs font-medium">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {product.pricing.currency}${product.pricing.currentPrice.toFixed(2)}
                </span>
                {product.pricing.discount && (
                  <span className="text-xs text-muted-foreground ml-2 line-through">
                    ${product.pricing.discount.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-amber-500 mr-1">★</span>
                <span className="text-sm font-medium">{product.marketReception.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({product.marketReception.reviewCount})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Feature Comparisons Component
const FeatureComparisons: React.FC<{ featureComparisons: FeatureComparison[] }> = ({ featureComparisons }) => {
  return (
    <div className="space-y-8">
      {featureComparisons.map((feature, index) => (
        <div key={index} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{feature.featureName}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feature.productAssessments.map((assessment, aIndex) => (
              <Card key={aIndex} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{assessment.productId}</CardTitle>
                    <Badge 
                      variant={assessment.rating > 7 ? "default" : assessment.rating > 4 ? "outline" : "destructive"}
                    >
                      Rating: {assessment.rating}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{assessment.assessment}</p>
                  
                  <h4 className="text-xs font-medium mb-1">Technical Details:</h4>
                  <ul className="text-xs space-y-0.5 mb-3">
                    {assessment.technicalDetails.map((detail, dIndex) => (
                      <li key={dIndex}>• {detail}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-xs font-medium mb-1">Practical Implications:</h4>
                  <p className="text-xs">{assessment.practicalImplications}</p>
                  
                  <div className="flex items-center mt-3 text-xs">
                    <span className="text-muted-foreground mr-1">Confidence:</span>
                    <Badge variant="outline" className={`
                      ${assessment.confidenceLevel === 'high' ? 'bg-green-50 text-green-700' : 
                        assessment.confidenceLevel === 'medium' ? 'bg-amber-50 text-amber-700' : 
                        'bg-red-50 text-red-700'}
                    `}>
                      {assessment.confidenceLevel}
                    </Badge>
                    {assessment.confidenceReason && <span className="ml-1 text-xs text-muted-foreground">{assessment.confidenceReason}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Verdict: {feature.verdict.bestProduct} excels in {feature.featureName}</h4>
            <p className="text-sm">{feature.verdict.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// User Personas Component
const UserPersonas: React.FC<{ userPersonas: UserPersona[] }> = ({ userPersonas }) => {
  return (
    <div className="space-y-6">
      {userPersonas.map((persona, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{persona.personaType}</CardTitle>
            <CardDescription>{persona.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Recommended Product: {persona.recommendedProduct}</h4>
              <p className="text-sm">{persona.reasoningDetail}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Ideal Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {persona.idealFeatures.map((feature, fIndex) => (
                  <div key={fIndex} className="bg-muted p-3 rounded-lg">
                    <h5 className="text-sm font-medium">{feature.feature}</h5>
                    <p className="text-xs text-muted-foreground">{feature.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Potential Concerns</h4>
              <div className="space-y-2">
                {persona.potentialConcerns.map((concern, cIndex) => (
                  <div key={cIndex} className="text-sm">
                    <span className="font-medium">{concern.concern}: </span>
                    <span>{concern.solution}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {persona.suggestedAccessories && persona.suggestedAccessories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Suggested Accessories</h4>
                <div className="space-y-1">
                  {persona.suggestedAccessories.map((accessory, aIndex) => (
                    <div key={aIndex} className="text-sm">
                      <span className="font-medium">{accessory.name}: </span>
                      <span className="text-muted-foreground">{accessory.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Expert Verdict Component
const ExpertVerdictSection: React.FC<{ expertVerdict: ExpertVerdict }> = ({ expertVerdict }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Best Overall Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mb-1">{expertVerdict.bestOverallValue.productId}</div>
            <p className="text-sm">{expertVerdict.bestOverallValue.rationale}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Best Technical Specs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mb-1">{expertVerdict.bestTechnicalSpecs.productId}</div>
            <p className="text-sm">{expertVerdict.bestTechnicalSpecs.rationale}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Most Satisfying for Most Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mb-1">{expertVerdict.mostSatisfyingForMostUsers.productId}</div>
            <p className="text-sm">{expertVerdict.mostSatisfyingForMostUsers.rationale}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specialized Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertVerdict.specializedScenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-1">{scenario.scenario}</h4>
                <div className="flex items-center mb-2">
                  <Badge className="text-xs">{scenario.recommendedProduct}</Badge>
                </div>
                <p className="text-xs">{scenario.explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Final Verdict</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{expertVerdict.conclusion}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisSection;