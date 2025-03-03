
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between w-full relative">
        <div className="absolute top-1/2 h-0.5 w-full bg-muted -z-10"></div>
        {steps.map((step, index) => (
          <button
            key={step}
            className={cn(
              "flex flex-col items-center space-y-2",
              currentStep === index || currentStep > index
                ? "opacity-100"
                : "opacity-60"
            )}
            onClick={() => index < currentStep && onStepClick(index)}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                currentStep === index
                  ? "bg-primary text-primary-foreground scale-110 shadow-md"
                  : currentStep > index
                  ? "bg-primary/80 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium">{step}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
