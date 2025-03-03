
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  CircleCheck, 
  CircleX,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import ComparisonRating from "@/components/comparison/ComparisonRating";
import ComparisonHeader from "@/components/comparison/ComparisonHeader";
import ProductFeature from "@/components/comparison/ProductFeature";
import { getComparison } from "@/services/productService";

const ComparisonPage = () => {
  const { comparisonId } = useParams();
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
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
    return (
      <div className="min-h-[calc(100vh-theme(space.20))] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="min-h-[calc(100vh-theme(space.20))] flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Comparison Not Found</h1>
        <p className="text-muted-foreground mb-6">The comparison you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/compare">Create New Comparison</Link>
        </Button>
      </div>
    );
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
          <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">AI Analysis Unavailable</h3>
                <p className="text-amber-700">
                  The AI analysis for these products could not be completed. This could be due to:
                </p>
                <ul className="list-disc ml-6 mt-2 text-amber-700">
                  <li>The AI service is currently unavailable or overloaded</li>
                  <li>Insufficient product data for meaningful analysis</li>
                  <li>Product specifications aren't in a format the AI can process</li>
                </ul>
                <div className="mt-4 flex items-center">
                  <Button 
                    variant="outline" 
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    onClick={() => window.location.reload()}
                  >
                    Retry Analysis
                  </Button>
                  <p className="ml-4 text-amber-700 text-sm">
                    For now, we're showing standard product information instead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mb-12">
          <div className="flex items-center justify-center md:justify-start">
            <div className="text-xl font-semibold text-center md:text-left">
              Overview
              <div className="mt-2 h-1 w-20 bg-primary rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonData.products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <div className="text-muted-foreground">{product.brand}</div>
                  </div>
                  <div className="text-lg font-bold">${product.price}</div>
                </div>
                
                <div className="flex items-center mb-4">
                  <ComparisonRating rating={product.rating} />
                </div>
                
                {product.overview && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    {product.overview}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">Pros</div>
                    <ul className="space-y-2">
                      {product.pros && product.pros.length > 0 ? (
                        product.pros.map((pro: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CircleCheck className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No pros available</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Cons</div>
                    <ul className="space-y-2">
                      {product.cons && product.cons.length > 0 ? (
                        product.cons.map((con: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CircleX className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No cons available</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mb-12">
          <div className="flex items-center justify-center md:justify-start">
            <div className="text-xl font-semibold text-center md:text-left">
              Key Features
              <div className="mt-2 h-1 w-20 bg-primary rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {comparisonData.featureImportance.map((feature: string) => (
              <ProductFeature 
                key={feature}
                feature={feature}
                products={comparisonData.products}
              />
            ))}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mb-12">
          <div className="flex items-center justify-center md:justify-start">
            <div className="text-xl font-semibold text-center md:text-left">
              Specifications
              <div className="mt-2 h-1 w-20 bg-primary rounded-full"></div>
            </div>
          </div>
          
          <ComparisonTable products={comparisonData.products} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
