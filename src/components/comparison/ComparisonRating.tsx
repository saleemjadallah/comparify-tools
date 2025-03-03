
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonRatingProps {
  rating: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const ComparisonRating = ({ 
  rating, 
  showValue = true, 
  size = "md" 
}: ComparisonRatingProps) => {
  // Convert rating to number of full and half stars (out of 5)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSizes[size],
              i < fullStars 
                ? "text-yellow-400 fill-yellow-400" 
                : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400 [clip-path:inset(0_50%_0_0)]"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
      
      {showValue && (
        <span className={cn("ml-2 font-medium", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default ComparisonRating;
