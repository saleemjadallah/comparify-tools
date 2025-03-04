
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpecificationParity } from '@/services/analysis/comparisonAnalysisTypes';
import { cn } from '@/lib/utils';

interface SpecificationParityTableProps {
  specificationParity: SpecificationParity;
  productIds: string[];
  productNames: string[];
}

const SpecificationParityTable = ({ 
  specificationParity,
  productIds,
  productNames 
}: SpecificationParityTableProps) => {
  if (!specificationParity || !specificationParity.categories || specificationParity.categories.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No specification data available for comparison.
      </div>
    );
  }

  const [activeCategory, setActiveCategory] = useState(specificationParity.categories[0].name);

  // Find the current active category
  const currentCategory = specificationParity.categories.find(
    category => category.name === activeCategory
  );

  if (!currentCategory) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <div className="px-4 pt-4">
          <TabsList className="w-full h-auto flex flex-wrap">
            {specificationParity.categories.map(category => (
              <TabsTrigger key={category.name} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value={activeCategory}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left font-medium text-muted-foreground w-1/4">
                    Specification
                  </th>
                  {productNames.map((name, index) => (
                    <th key={index} className="py-4 px-6 text-left font-semibold">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCategory.specifications.map((spec, index) => (
                  <tr key={spec.name} className={cn(index !== currentCategory.specifications.length - 1 && "border-b")}>
                    <td className="py-4 px-6 font-medium group relative">
                      {spec.name}
                      {spec.explanation && (
                        <div className="absolute hidden group-hover:block z-10 bg-white p-3 shadow-lg rounded-md border w-64 text-sm -mt-2 left-full ml-2">
                          {spec.explanation}
                        </div>
                      )}
                    </td>
                    {productIds.map(productId => {
                      const specValue = spec.values[productId];
                      
                      if (!specValue) {
                        return (
                          <td key={productId} className="py-4 px-6 text-muted-foreground">
                            —
                          </td>
                        );
                      }
                      
                      return (
                        <td 
                          key={productId} 
                          className={cn(
                            "py-4 px-6",
                            specValue.isSuperior && "font-semibold text-green-700",
                            specValue.isMissing && "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            {specValue.value}
                            {specValue.isSuperior && (
                              <CheckCircle2 
                                className="ml-2 text-green-600" 
                                size={16} 
                                title="Superior specification" 
                              />
                            )}
                            {specValue.isMarketing && (
                              <AlertCircle 
                                className="ml-2 text-amber-500" 
                                size={16} 
                                title="Marketing term rather than technical specification" 
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpecificationParityTable;
