
import { useState } from "react";
import { useValidation } from "./validationUtils";
import { ComparisonState } from "./types";

export const useNavigationOperations = (state: ComparisonState, generateComparison: () => Promise<void>) => {
  const { validateCurrentStep } = useValidation();
  const [currentStep, setCurrentStep] = useState(state.currentStep);

  // Navigate to next step
  const nextStep = async () => {
    if (!validateCurrentStep({ ...state, currentStep })) return;
    
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateComparison();
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep
  };
};
