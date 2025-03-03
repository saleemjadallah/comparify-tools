
import { cn } from "@/lib/utils";
import ComparisonRating from "./ComparisonRating";
import { ProductSearchResult as SearchResultType } from "@/services/productService";

interface ProductSearchResultProps {
  product: SearchResultType;
  onClick: () => void;
}

const ProductSearchResult = ({ product, onClick }: ProductSearchResultProps) => {
  return (
    <div
      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-foreground">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.brand}</div>
        </div>
        <div className="text-sm font-medium">${product.price}</div>
      </div>
      
      {product.rating && (
        <div className="mt-1">
          <ComparisonRating rating={product.rating} size="sm" />
        </div>
      )}
      
      {product.specs && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
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
