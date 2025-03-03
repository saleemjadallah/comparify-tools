
import { cn } from "@/lib/utils";

interface ComparisonTableProps {
  products: any[];
}

const ComparisonTable = ({ products }: ComparisonTableProps) => {
  if (!products || products.length === 0) return null;
  
  // Get all specification keys from all products
  const allSpecKeys = new Set<string>();
  products.forEach(product => {
    if (product.specs) {
      Object.keys(product.specs).forEach(key => {
        // Skip the featureRatings object since we display it separately
        if (key !== 'featureRatings') {
          allSpecKeys.add(key);
        }
      });
    }
  });
  
  // Convert to array and sort alphabetically
  const specKeys = Array.from(allSpecKeys).sort();
  
  if (specKeys.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <p className="text-muted-foreground">No specifications available for these products.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto w-full bg-white rounded-xl shadow-sm border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-4 px-6 text-left font-medium text-muted-foreground w-1/4">
              Specification
            </th>
            {products.map((product) => (
              <th key={product.id} className="py-4 px-6 text-left font-semibold">
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specKeys.map((key, index) => (
            <tr key={key} className={cn(index !== specKeys.length - 1 && "border-b")}>
              <td className="py-4 px-6 font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </td>
              {products.map((product) => (
                <td key={product.id} className="py-4 px-6">
                  {product.specs && product.specs[key] !== undefined 
                    ? (typeof product.specs[key] === 'object' 
                        ? JSON.stringify(product.specs[key]) 
                        : product.specs[key])
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
