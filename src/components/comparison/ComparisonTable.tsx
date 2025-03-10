
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearchResult } from "@/services/types";

interface ComparisonTableProps {
  products: ProductSearchResult[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ComparisonTable = ({ products }: ComparisonTableProps) => {
  if (!products || products.length === 0) return null;
  
  // Get all specification keys from all products
  const allSpecKeys = new Set<string>();
  
  // Get all spec categories from products
  const allSpecCategories = new Set<string>();
  
  products.forEach(product => {
    // First try to use enhancedSpecs if available
    if (product.enhancedSpecs) {
      Object.keys(product.enhancedSpecs).forEach(category => {
        allSpecCategories.add(category);
        
        // Add each spec with category prefix
        Object.keys(product.enhancedSpecs[category]).forEach(spec => {
          allSpecKeys.add(`${category}: ${spec}`);
        });
      });
    }
    // Fall back to regular specs
    else if (product.specs) {
      Object.keys(product.specs).forEach(key => {
        // Skip the featureRatings object since we display it separately
        if (key !== 'featureRatings') {
          // Check if the key has a category prefix (e.g. "Display: Resolution")
          if (key.includes(': ')) {
            const category = key.split(': ')[0];
            allSpecCategories.add(category);
          }
          allSpecKeys.add(key);
        }
      });
    }
  });
  
  // Convert to array and sort alphabetically
  const specKeys = Array.from(allSpecKeys).sort();
  const specCategories = Array.from(allSpecCategories).sort();
  
  // Default to "All" tab
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Filter specs by category
  const filteredSpecKeys = activeCategory === "All" 
    ? specKeys 
    : specKeys.filter(key => key.startsWith(activeCategory + ': '));
  
  if (specKeys.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <p className="text-muted-foreground">No specifications available for these products.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border">
      <Tabs defaultValue="All" onValueChange={setActiveCategory}>
        <div className="px-4 pt-4">
          <TabsList className="w-full h-auto flex flex-wrap">
            <TabsTrigger value="All">All Specs</TabsTrigger>
            {specCategories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value={activeCategory} className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left font-medium text-muted-foreground w-1/4">
                    Specification
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="py-4 px-6 text-left font-semibold">
                      {truncateText(product.name, 15)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSpecKeys.map((key, index) => {
                  // For categorized specs, remove the category prefix for display
                  const displayKey = key.includes(': ') ? key.split(': ')[1] : key;
                  
                  return (
                    <tr key={key} className={cn(index !== filteredSpecKeys.length - 1 && "border-b")}>
                      <td className="py-4 px-6 font-medium">
                        {displayKey}
                      </td>
                      {products.map((product) => {
                        // Check if using enhancedSpecs or regular specs
                        let specValue = "—";
                        
                        if (product.enhancedSpecs && key.includes(': ')) {
                          const [category, spec] = key.split(': ');
                          if (product.enhancedSpecs[category] && product.enhancedSpecs[category][spec] !== undefined) {
                            specValue = product.enhancedSpecs[category][spec];
                          }
                        } else if (product.specs && product.specs[key] !== undefined) {
                          specValue = typeof product.specs[key] === 'object' 
                                      ? JSON.stringify(product.specs[key]) 
                                      : product.specs[key];
                        }
                        
                        return (
                          <td key={product.id} className="py-4 px-6">
                            {specValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparisonTable;
