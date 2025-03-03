
import { useState } from "react";
import { Search, X, Info, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProductSearchResult from "./ProductSearchResult";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ComparisonRating from "./ComparisonRating";
import { searchProducts, ProductSearchResult as SearchResultType } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  details?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    rating?: number;
    specs?: {
      [key: string]: string;
    };
  };
}

interface ProductFieldProps {
  product: Product;
  index: number;
  category: string;
  updateProductName: (id: string, name: string) => void;
  selectProduct: (product: any, index: number) => void;
  removeProduct: (id: string) => void;
  canRemove: boolean;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ProductField = ({
  product,
  index,
  category,
  updateProductName,
  selectProduct,
  removeProduct,
  canRemove
}: ProductFieldProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultType[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    updateProductName(product.id, query);
    
    if (query.length < 2 || !category) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Use our service to search for products
      const results = await searchProducts(query, category);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (selectedProduct: SearchResultType) => {
    selectProduct(selectedProduct, index);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-grow relative">
          <Label htmlFor={`product-${index}`} className="sr-only">
            Product {index + 1}
          </Label>
          <div className="relative">
            <Input
              id={`product-${index}`}
              placeholder={`Product ${index + 1} name or model`}
              value={product.name}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className={`w-full pr-10 ${isFocused ? 'ring-2 ring-primary/30' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary/50 rounded-full border-t-transparent" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && isFocused && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border z-50 max-h-64 overflow-auto divide-y divide-gray-100">
              {searchResults.map((result) => (
                <ProductSearchResult 
                  key={result.id} 
                  product={result} 
                  onClick={() => handleProductSelect(result)}
                />
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeProduct(product.id)}
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove product</span>
        </Button>
      </div>
      
      {/* Enhanced Product Details (if selected from search) */}
      {product.details && (
        <div className="ml-2 pl-3 border-l-2 border-primary/20 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium text-foreground">{product.details.brand}</span>
              {' • '}
              <span className="text-muted-foreground">${product.details.price}</span>
            </div>
            
            {product.details.rating && (
              <div className="flex items-center">
                <ComparisonRating rating={product.details.rating} size="sm" />
              </div>
            )}
          </div>
          
          {product.details.specs && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1">
              {Object.entries(product.details.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mr-1" />
                  View more details
                </Button>
              </TooltipTrigger>
              <TooltipContent className="p-0 max-w-xs">
                <div className="p-3 text-xs">
                  <div className="font-medium mb-1">{product.details.name}</div>
                  <p className="text-muted-foreground">
                    Full product information will be available in the comparison view.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default ProductField;
