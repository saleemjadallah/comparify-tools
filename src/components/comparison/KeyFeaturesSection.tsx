
import React from "react";
import ProductFeature from "@/components/comparison/ProductFeature";
import SectionContainer from "@/components/comparison/SectionContainer";

interface KeyFeaturesSectionProps {
  featureImportance: string[];
  products: any[];
}

const KeyFeaturesSection = ({ featureImportance, products }: KeyFeaturesSectionProps) => {
  return (
    <SectionContainer title="Key Features">
      <div className="grid grid-cols-1 gap-6">
        {featureImportance.map((feature: string) => (
          <ProductFeature 
            key={feature}
            feature={feature}
            products={products}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default KeyFeaturesSection;
