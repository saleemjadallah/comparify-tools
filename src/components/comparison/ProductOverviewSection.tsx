
import React from "react";
import { CircleCheck, CircleX } from "lucide-react";
import ComparisonRating from "@/components/comparison/ComparisonRating";
import SectionContainer from "@/components/comparison/SectionContainer";

interface ProductOverviewSectionProps {
  products: any[];
}

const ProductOverviewSection = ({ products }: ProductOverviewSectionProps) => {
  return (
    <SectionContainer title="Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <div className="text-muted-foreground">{product.brand}</div>
              </div>
              <div className="text-lg font-bold">${product.price}</div>
            </div>
            
            <div className="flex items-center mb-4">
              <ComparisonRating rating={product.rating} />
            </div>
            
            {product.overview && (
              <div className="mb-4 text-sm text-muted-foreground">
                {product.overview}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <div className="font-medium mb-2">Pros</div>
                <ul className="space-y-2">
                  {product.pros && product.pros.length > 0 ? (
                    product.pros.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No pros available</li>
                  )}
                </ul>
              </div>
              
              <div>
                <div className="font-medium mb-2">Cons</div>
                <ul className="space-y-2">
                  {product.cons && product.cons.length > 0 ? (
                    product.cons.map((con: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CircleX className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No cons available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};

export default ProductOverviewSection;
