
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Printer, Download } from "lucide-react";
import { toast } from "sonner";

interface ComparisonHeaderProps {
  category: string;
  products: any[];
  comparisonId: string;
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ComparisonHeader = ({ category, products, comparisonId }: ComparisonHeaderProps) => {
  const handleShare = () => {
    // In a real app, you would generate a shareable link
    navigator.clipboard.writeText(`${window.location.origin}/compare/${comparisonId}`);
    toast.success("Comparison link copied to clipboard");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, you would generate a PDF or other format
    toast.success("Comparison downloaded");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">
          {products.map(p => truncateText(p.name)).join(" vs ")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {category} Comparison
        </p>
      </div>
      
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default ComparisonHeader;
