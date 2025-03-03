
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  ArrowDown, 
  CircleCheck, 
  CircleX, 
  Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockProductDatabase } from "@/data/products";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import ComparisonRating from "@/components/comparison/ComparisonRating";
import ComparisonHeader from "@/components/comparison/ComparisonHeader";
import ProductFeature from "@/components/comparison/ProductFeature";
import { Link } from "react-router-dom";

// Mock data - In a real app, this would come from your backend or state management
const mockComparisonData = {
  category: "Smartphones",
  products: [
    {
      id: "s1",
      name: "iPhone 14 Pro",
      brand: "Apple",
      price: 999,
      image: "/placeholder.svg",
      rating: 4.8,
      specs: {
        processor: "A16 Bionic",
        ram: "6GB",
        storage: "128GB/256GB/512GB/1TB",
        display: "6.1-inch Super Retina XDR",
        camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
        battery: "3200 mAh",
        os: "iOS 16"
      },
      pros: [
        "Excellent performance",
        "Great camera system",
        "Premium build quality",
        "Long software support"
      ],
      cons: [
        "Expensive",
        "No USB-C",
        "Average battery life"
      ]
    },
    {
      id: "s2",
      name: "Samsung Galaxy S23",
      brand: "Samsung",
      price: 799,
      image: "/placeholder.svg",
      rating: 4.7,
      specs: {
        processor: "Snapdragon 8 Gen 2",
        ram: "8GB",
        storage: "128GB/256GB",
        display: "6.1-inch Dynamic AMOLED 2X",
        camera: "50MP Main, 12MP Ultra Wide, 10MP Telephoto",
        battery: "3900 mAh",
        os: "Android 13"
      },
      pros: [
        "Excellent display",
        "Solid camera performance",
        "Good battery life",
        "Improved performance"
      ],
      cons: [
        "Slow charging",
        "Limited storage options",
        "Higher price than competitors"
      ]
    }
  ],
  featureImportance: [
    "Camera Quality",
    "Battery Life",
    "Performance",
    "Value for Money"
  ]
};

const ComparisonPage = () => {
  const { comparisonId } = useParams();
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch data from your API using the comparisonId
    // For now, we'll use mock data and simulate a loading state
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setComparisonData(mockComparisonData);
      } catch (error) {
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
                
                <div className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">Pros</div>
                    <ul className="space-y-2">
                      {product.pros.map((pro: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <CircleCheck className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Cons</div>
                    <ul className="space-y-2">
                      {product.cons.map((con: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <CircleX className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
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
