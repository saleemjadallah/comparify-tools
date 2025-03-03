
import { ReactNode } from "react";
import StepIndicator from "@/components/comparison/StepIndicator";
import NavigationButtons from "@/components/comparison/NavigationButtons";

interface ComparisonBuilderContainerProps {
  steps: string[];
  currentStep: number;
  isLoading: boolean;
  onStepClick: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  children: ReactNode;
}

const ComparisonBuilderContainer = ({
  steps,
  currentStep,
  isLoading,
  onStepClick,
  onNext,
  onPrev,
  children
}: ComparisonBuilderContainerProps) => {
  return (
    <div className="min-h-[calc(100vh-theme(space.20))] flex flex-col">
      <div className="flex-grow px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Steps */}
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={(index) => index < currentStep && onStepClick(index)} 
          />

          {/* Step Content */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            {children}

            {/* Navigation Buttons */}
            <NavigationButtons 
              currentStep={currentStep}
              totalSteps={steps.length}
              nextStep={onNext}
              prevStep={onPrev}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBuilderContainer;
