
import { cn } from "@/lib/utils";

interface ProductFeatureProps {
  feature: string;
  products: any[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ProductFeature = ({ feature, products }: ProductFeatureProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-secondary py-3 px-6 border-b">
        <h3 className="font-semibold">{feature}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {products.map((product) => {
          // Check if we have AI-generated feature ratings from specs.featureRatings
          const featureRatings = product.specs?.featureRatings || {};
          
          // Try to get the rating for this specific feature
          // Note: the feature key in the DB might be formatted differently than the UI
          const aiRating = featureRatings[feature] || 
                           featureRatings[feature.toLowerCase()] || 
                           featureRatings[feature.replace(/\s+/g, '')];
          
          // Fallback data for development/testing
          const mockFeatureData: Record<string, Record<string, { rating: number; description: string }>> = {
            "Performance": {
              "iPhone 14 Pro": { 
                rating: 9, 
                description: "Exceptional performance with the A16 Bionic chip. Handles all tasks with ease."
              },
              "Samsung Galaxy S23": { 
                rating: 8, 
                description: "Fast and responsive with the Snapdragon 8 Gen 2 processor."
              }
            },
            "Battery Life": {
              "iPhone 14 Pro": { 
                rating: 7, 
                description: "Decent battery life that will get most users through a full day of moderate use."
              },
              "Samsung Galaxy S23": { 
                rating: 8, 
                description: "Good battery life with improved efficiency. Easily lasts a full day."
              }
            },
            "Display Quality": {
              "iPhone 14 Pro": { 
                rating: 9, 
                description: "Stunning display with excellent brightness and color accuracy."
              },
              "Samsung Galaxy S23": { 
                rating: 9, 
                description: "Beautiful AMOLED display with vibrant colors and deep blacks."
              }
            },
            "Storage": {
              "iPhone 14 Pro": { 
                rating: 8, 
                description: "Comes with ample storage options but no expandable storage."
              },
              "Samsung Galaxy S23": { 
                rating: 9, 
                description: "Good internal storage options plus microSD card support for expansion."
              }
            },
            "Design": {
              "iPhone 14 Pro": { 
                rating: 8, 
                description: "Premium build quality with elegant design and excellent materials."
              },
              "Samsung Galaxy S23": { 
                rating: 8, 
                description: "Sleek design with premium materials and good ergonomics."
              }
            },
            "Warranty": {
              "iPhone 14 Pro": { 
                rating: 7, 
                description: "Standard 1-year warranty with optional AppleCare+ for extended coverage."
              },
              "Samsung Galaxy S23": { 
                rating: 7, 
                description: "Standard manufacturer warranty with optional Samsung Care+ available."
              }
            }
          };
          
          // Use either AI-generated rating or mock data (for testing/development)
          const mockProductData = mockFeatureData[feature]?.[product.name];
          
          // Use AI-generated rating if available, otherwise fall back to mock data
          const featureData = aiRating ? {
            rating: aiRating.rating,
            description: aiRating.explanation
          } : mockProductData;
          
          // If no data is available at all
          if (!featureData) {
            return (
              <div key={product.id} className="p-6">
                <div className="font-medium mb-2">{truncateText(product.name, 20)}</div>
                <div className="text-muted-foreground text-sm">No data available</div>
              </div>
            );
          }
          
          console.log(`Feature ${feature} for ${product.name}:`, { aiRating, featureData });
          
          return (
            <div key={product.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{truncateText(product.name, 20)}</div>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">{featureData.rating}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full",
                      featureData.rating >= 9 ? "bg-green-500" :
                      featureData.rating >= 7 ? "bg-blue-500" :
                      featureData.rating >= 5 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${(featureData.rating / 10) * 100}%` }}
                  />
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {featureData.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductFeature;
