
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
}

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  nextStep, 
  prevStep 
}: NavigationButtonsProps) => {
  return (
    <div className="mt-8 flex justify-between">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 0}
      >
        Back
      </Button>
      <Button onClick={nextStep}>
        {currentStep < totalSteps - 1 ? (
          <>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          "Generate Comparison"
        )}
      </Button>
    </div>
  );
};

export default NavigationButtons;
