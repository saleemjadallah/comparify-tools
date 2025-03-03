
import { cn } from "@/lib/utils";

interface ComparisonTableProps {
  products: any[];
}

const ComparisonTable = ({ products }: ComparisonTableProps) => {
  if (!products || products.length === 0) return null;
  
  // Get all specification keys from the first product
  const specKeys = Object.keys(products[0].specs);
  
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
                  {product.specs[key]}
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
