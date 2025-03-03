
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ComparisonNotFound = () => {
  return (
    <div className="min-h-[calc(100vh-theme(space.20))] flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Comparison Not Found</h1>
      <p className="text-muted-foreground mb-6">The comparison you're looking for doesn't exist or has been removed.</p>
      <Button asChild>
        <Link to="/compare">Create New Comparison</Link>
      </Button>
    </div>
  );
};

export default ComparisonNotFound;
