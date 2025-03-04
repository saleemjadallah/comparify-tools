
import React from 'react';
import { cn } from "@/lib/utils";

interface FeatureRatingBarProps {
  rating: number;
}

const FeatureRatingBar = ({ rating }: FeatureRatingBarProps) => {
  return (
    <div className="mb-3">
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full",
            rating >= 9 ? "bg-green-500" :
            rating >= 7 ? "bg-blue-500" :
            rating >= 5 ? "bg-amber-500" :
            "bg-red-500"
          )}
          style={{ width: `${(rating / 10) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default FeatureRatingBar;
