
import React from "react";
import FeatureRatingHeader from "./FeatureRatingHeader";
import ProductFeatureCell from "./ProductFeatureCell";

interface ProductFeatureProps {
  feature: string;
  products: any[];
}

const ProductFeature = ({ feature, products }: ProductFeatureProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <FeatureRatingHeader feature={feature} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {products.map((product) => (
          <ProductFeatureCell 
            key={product.id} 
            product={product} 
            feature={feature} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductFeature;
