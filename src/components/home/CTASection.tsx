
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="px-6 py-24 bg-black text-white">
      <div className="max-w-screen-xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Compare?</h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Start making informed decisions with our comprehensive product comparisons.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full px-8 bg-white text-black hover:bg-gray-100">
          <Link to="/compare">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
