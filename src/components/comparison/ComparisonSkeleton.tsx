
import React from "react";

const ComparisonSkeleton = () => {
  return (
    <div className="min-h-[calc(100vh-theme(space.20))] flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-4xl">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default ComparisonSkeleton;
