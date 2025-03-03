
import React from "react";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import SectionContainer from "@/components/comparison/SectionContainer";

interface SpecificationsSectionProps {
  products: any[];
}

const SpecificationsSection = ({ products }: SpecificationsSectionProps) => {
  return (
    <SectionContainer title="Specifications">
      <ComparisonTable products={products} />
    </SectionContainer>
  );
};

export default SpecificationsSection;
