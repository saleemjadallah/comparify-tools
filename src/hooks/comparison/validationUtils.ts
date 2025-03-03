
import { ComparisonState } from "./types";
import { useToast } from "@/hooks/use-toast";

export const useValidation = () => {
  const { toast } = useToast();

  const validateCurrentStep = (state: ComparisonState): boolean => {
    if (state.currentStep === 0 && !state.category) {
      toast({
        title: "Please select a category",
        description: "You need to select a product category before continuing.",
        variant: "destructive",
      });
      return false;
    }
    
    if (state.currentStep === 1 && state.products.some(p => !p.name)) {
      toast({
        title: "Missing product names",
        description: "Please fill in all product names before continuing.",
        variant: "destructive",
      });
      return false;
    }
    
    if (state.currentStep === 2 && state.featureImportance.length === 0) {
      toast({
        title: "No features selected",
        description: "Please select at least one feature for comparison.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateCurrentStep };
};
