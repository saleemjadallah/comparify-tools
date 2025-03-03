
import { cn } from "@/lib/utils";

interface FeatureItemProps {
  feature: string;
  isSelected: boolean;
  onClick: () => void;
}

const FeatureItem = ({ feature, isSelected, onClick }: FeatureItemProps) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-3 cursor-pointer transition-all-200",
        isSelected
          ? "bg-primary/5 border-primary/30"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{feature}</span>
        <div
          className={cn(
            "h-4 w-4 rounded-full border",
            isSelected
              ? "bg-primary border-primary"
              : "border-muted-foreground"
          )}
        >
          {isSelected && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureItem;
