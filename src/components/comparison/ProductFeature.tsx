
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

// Helper function to normalize feature names for comparison
const normalizeFeatureName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const ProductFeature = ({ feature, products }: ProductFeatureProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-secondary py-3 px-6 border-b">
        <h3 className="font-semibold">{feature}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {products.map((product) => {
          // Extract the feature ratings from the right location
          // It could be in product.specs.featureRatings or directly in product.featureRatings
          let featureRatings = {};
          
          if (product.specs && product.specs.featureRatings) {
            featureRatings = product.specs.featureRatings;
            console.log(`Found featureRatings in product.specs.featureRatings for ${product.name}`);
          } else if (product.featureRatings) {
            featureRatings = product.featureRatings;
            console.log(`Found featureRatings directly in product.featureRatings for ${product.name}`);
          }
          
          // Normalize current feature name
          const normalizedFeature = normalizeFeatureName(feature);
          
          // Log the available feature ratings for debugging
          console.log(`Feature ratings for ${product.name}:`, 
            Object.keys(featureRatings).length > 0 
              ? Object.keys(featureRatings).join(', ') 
              : 'None available');
          
          // Try different formats of the feature name to find a match
          let aiRating = null;
          
          // Multiple attempts to match the feature name
          const possibleFeatureKeys = [
            feature,                                    // Exact match
            feature.toLowerCase(),                      // Lowercase
            normalizedFeature,                          // Normalized (alphanumeric only)
            feature.replace(/\s+/g, ''),                // No spaces
            feature.replace(/[^a-zA-Z0-9]/g, '')        // Alphanumeric only
          ];
          
          // Try each possible key format
          for (const key of possibleFeatureKeys) {
            if (featureRatings[key]) {
              aiRating = featureRatings[key];
              console.log(`Found match for "${feature}" using key "${key}" in ${product.name}`);
              break;
            }
          }
          
          // If still no match, try a more fuzzy approach by checking if any key contains the feature
          if (!aiRating) {
            const featureKeys = Object.keys(featureRatings);
            for (const key of featureKeys) {
              const normalizedKey = normalizeFeatureName(key);
              if (normalizedKey.includes(normalizedFeature) || normalizedFeature.includes(normalizedKey)) {
                aiRating = featureRatings[key];
                console.log(`Found fuzzy match for "${feature}" using key "${key}" in ${product.name}`);
                break;
              }
            }
          }
          
          // Last resort: look for any partial string match
          if (!aiRating) {
            const featureKeys = Object.keys(featureRatings);
            for (const key of featureKeys) {
              if (key.toLowerCase().includes(feature.toLowerCase()) || 
                  feature.toLowerCase().includes(key.toLowerCase())) {
                aiRating = featureRatings[key];
                console.log(`Found partial string match for "${feature}" using key "${key}" in ${product.name}`);
                break;
              }
            }
          }
          
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
          
          // Use either AI-generated rating if available, otherwise fall back to mock data
          const mockProductData = mockFeatureData[feature]?.[product.name];
          
          // Use AI-generated rating if available, otherwise fall back to mock data
          const featureData = aiRating ? {
            rating: aiRating.rating,
            description: aiRating.explanation
          } : mockProductData;
          
          // If no data is available at all
          if (!featureData) {
            console.log(`No feature data available for "${feature}" in ${product.name}`);
            return (
              <div key={product.id} className="p-6">
                <div className="font-medium mb-2">{truncateText(product.name, 20)}</div>
                <div className="text-muted-foreground text-sm">No data available</div>
              </div>
            );
          }
          
          console.log(`Feature "${feature}" for ${product.name}:`, { aiRating, featureData });
          
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
