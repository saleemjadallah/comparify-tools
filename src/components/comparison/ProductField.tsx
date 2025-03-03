
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProductSearchResult from "./ProductSearchResult";
import { mockProductDatabase } from "@/data/products";

interface Product {
  id: string;
  name: string;
  details?: {
    id: string;
    name: string;
    brand: string;
    price: number;
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

const ProductField = ({
  product,
  index,
  category,
  updateProductName,
  selectProduct,
  removeProduct,
  canRemove
}: ProductFieldProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateProductName(product.id, query);
    
    if (query.length < 2 || !category) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter products based on the query and selected category
    const categoryProducts = mockProductDatabase[category as keyof typeof mockProductDatabase] || [];
    const results = categoryProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const handleProductSelect = (selectedProduct: any) => {
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
              className="w-full pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border z-50 max-h-64 overflow-auto">
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
      
      {/* Product Details (if selected from search) */}
      {product.details && (
        <div className="ml-2 pl-3 border-l-2 border-primary/20 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{product.details.brand}</span>
            {' • '}${product.details.price}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductField;
