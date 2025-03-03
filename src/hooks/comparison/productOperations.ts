
import { Product } from "./types";
import { useToast } from "@/hooks/use-toast";

export const useProductOperations = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const { toast } = useToast();

  // Add a new product
  const addProduct = () => {
    if (products.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can compare up to 5 products at a time.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts([...products, { name: "", id: crypto.randomUUID() }]);
  };

  // Remove a product
  const removeProduct = (id: string) => {
    if (products.length <= 2) {
      toast({
        title: "Minimum requirement",
        description: "You need at least 2 products to compare.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts(products.filter(product => product.id !== id));
  };

  // Update product name
  const updateProductName = (id: string, name: string) => {
    setProducts(
      products.map(product => 
        product.id === id ? { ...product, name } : product
      )
    );
  };

  // Select product from search results
  const selectProduct = (product: any, productIndex: number) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      id: updatedProducts[productIndex].id,
      name: product.name,
      details: product
    };
    
    setProducts(updatedProducts);
  };

  return {
    addProduct,
    removeProduct,
    updateProductName,
    selectProduct
  };
};
