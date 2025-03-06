import React from "react";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import SectionContainer from "@/components/comparison/SectionContainer";
import { ProductSearchResult } from "@/services/types";
import { enhancedSpecProcessing } from "@/utils/enhancedSpecs";

interface SpecificationsSectionProps {
  products: ProductSearchResult[];
}

const SpecificationsSection = ({ products }: SpecificationsSectionProps) => {
  // Process any products that don't have enhancedSpecs yet
  const processedProducts = products.map(product => {
    if (!product.enhancedSpecs && product.specs) {
      // Create a basic category if not provided (this would be more sophisticated in production)
      const category = product.category || 'General';
      product.enhancedSpecs = enhancedSpecProcessing(product, category);
    }
    return product;
  });

  return (
    <SectionContainer title="Detailed Specifications">
      <p className="text-muted-foreground mb-4">
        Compare detailed technical specifications across products. Use the tabs to view specifications by category.
      </p>
      <ComparisonTable products={processedProducts} />
    </SectionContainer>
  );
};

export default SpecificationsSection;
