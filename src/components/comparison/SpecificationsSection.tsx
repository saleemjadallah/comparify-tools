
import React from "react";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import SectionContainer from "@/components/comparison/SectionContainer";

interface SpecificationsSectionProps {
  products: any[];
}

const SpecificationsSection = ({ products }: SpecificationsSectionProps) => {
  return (
    <SectionContainer title="Detailed Specifications">
      <p className="text-muted-foreground mb-4">
        Compare detailed technical specifications across products. Use the tabs to view specifications by category.
      </p>
      <ComparisonTable products={products} />
    </SectionContainer>
  );
};

export default SpecificationsSection;
