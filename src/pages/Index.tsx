
import { useRef } from "react";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import PricingSection from "@/components/home/PricingSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <Hero scrollToFeatures={scrollToFeatures} />
      
      {/* Features Section */}
      <div ref={featuresRef}>
        <Features />
      </div>
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;
