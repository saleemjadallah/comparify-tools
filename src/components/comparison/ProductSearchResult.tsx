import { cn } from "@/lib/utils";
import ComparisonRating from "./ComparisonRating";
import { ProductSearchResult as SearchResultType } from "@/services/productService";
import { getTopSpecs } from "@/utils/enhancedSpecProcessing";

interface ProductSearchResultProps {
  product: SearchResultType;
  onClick: () => void;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 40) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ProductSearchResult = ({ product, onClick }: ProductSearchResultProps) => {
  // Extract a few key features to show in the search result
  const keyFeatures = product.features?.slice(0, 2) || [];
  
  // Get the top specifications based on product category
  const topSpecs: Record<string, string> = {};
  if (product.specs && product.category) {
    // First try to use enhancedSpecs if available
    if (product.enhancedSpecs) {
      const enhancedTopSpecs = getTopSpecs(product.enhancedSpecs, product.category, 4);
      Object.assign(topSpecs, enhancedTopSpecs);
    } 
    // Otherwise use the existing specs
    else {
      const specEntries = Object.entries(product.specs).slice(0, 4);
      specEntries.forEach(([key, value]) => {
        topSpecs[key] = value;
      });
    }
  }
  
  return (
    <div
      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-foreground">{truncateText(product.name)}</div>
          <div className="text-sm text-muted-foreground">{product.brand}</div>
        </div>
        <div className="text-sm font-medium">${product.price}</div>
      </div>
      
      {product.rating && (
        <div className="mt-1">
          <ComparisonRating rating={product.rating} size="sm" />
        </div>
      )}
      
      {/* Show key features if available */}
      {keyFeatures.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="line-clamp-1">• {feature}</div>
          ))}
        </div>
      )}
      
      {/* Show top specifications */}
      {Object.keys(topSpecs).length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries(topSpecs).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearchResult;
