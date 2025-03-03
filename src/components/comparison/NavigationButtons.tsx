
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  isLoading?: boolean;
}

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  nextStep, 
  prevStep,
  isLoading = false
}: NavigationButtonsProps) => {
  return (
    <div className="mt-8 flex justify-between">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 0 || isLoading}
      >
        Back
      </Button>
      <Button 
        onClick={nextStep} 
        disabled={isLoading}
        className="min-w-[160px] justify-center"
      >
        {currentStep < totalSteps - 1 ? (
          <>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Comparison"
        )}
      </Button>
    </div>
  );
};

export default NavigationButtons;
