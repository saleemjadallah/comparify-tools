
import React, { ReactNode } from "react";

interface SectionContainerProps {
  title: string;
  children: ReactNode;
}

const SectionContainer = ({ title, children }: SectionContainerProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mb-12">
      <div className="flex items-center justify-center md:justify-start">
        <div className="text-xl font-semibold text-center md:text-left">
          {title}
          <div className="mt-2 h-1 w-20 bg-primary rounded-full"></div>
        </div>
      </div>
      
      <div>{children}</div>
    </div>
  );
};

export default SectionContainer;
