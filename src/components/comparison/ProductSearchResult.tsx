
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
}

interface ProductSearchResultProps {
  product: Product;
  onClick: () => void;
}

const ProductSearchResult = ({ product, onClick }: ProductSearchResultProps) => {
  return (
    <div
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
      onClick={onClick}
    >
      <div>
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-muted-foreground">{product.brand}</div>
      </div>
      <div className="text-sm font-medium">${product.price}</div>
    </div>
  );
};

export default ProductSearchResult;
