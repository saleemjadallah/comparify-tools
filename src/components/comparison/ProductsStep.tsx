
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductField from "./ProductField";

interface Product {
  id: string;
  name: string;
  details?: any;
}

interface ProductsStepProps {
  products: Product[];
  category: string;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProductName: (id: string, name: string) => void;
  selectProduct: (product: any, productIndex: number) => void;
  removeProduct: (id: string) => void;
  addProduct: () => void;
}

const ProductsStep = ({
  products,
  category,
  updateProductName,
  selectProduct,
  removeProduct,
  addProduct
}: ProductsStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Add Products to Compare</h2>
        <p className="text-muted-foreground">
          Enter the names or models of the products you want to compare (2-5 products).
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <ProductField
            key={product.id}
            product={product}
            index={index}
            category={category}
            updateProductName={updateProductName}
            selectProduct={selectProduct}
            removeProduct={removeProduct}
            canRemove={products.length > 2}
          />
        ))}

        <Button
          variant="outline"
          onClick={addProduct}
          disabled={products.length >= 5}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Product
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductsStep;
