
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisStatusAlertProps {
  onRetry: () => void;
}

const AnalysisStatusAlert = ({ onRetry }: AnalysisStatusAlertProps) => {
  return (
    <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-medium text-amber-800">AI Analysis Unavailable</h3>
          <p className="text-amber-700">
            The AI analysis for these products could not be completed. This could be due to:
          </p>
          <ul className="list-disc ml-6 mt-2 text-amber-700">
            <li>The AI service is currently unavailable or overloaded</li>
            <li>Insufficient product data for meaningful analysis</li>
            <li>Product specifications aren't in a format the AI can process</li>
          </ul>
          <div className="mt-4 flex items-center">
            <Button 
              variant="outline" 
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
              onClick={onRetry}
            >
              Retry Analysis
            </Button>
            <p className="ml-4 text-amber-700 text-sm">
              For now, we're showing standard product information instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStatusAlert;
