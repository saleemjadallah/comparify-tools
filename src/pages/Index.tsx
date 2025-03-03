
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ArrowDown, BarChart3, SearchCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-screen-xl mx-auto">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Intelligent Product Comparisons
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Compare Products with
              <br />
              <span className="text-primary">Clarity & Precision</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Make informed purchasing decisions with our comprehensive, data-driven
              product comparisons. See the differences that matter most.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/compare">
                  Create Comparison <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 md:mt-20 relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80"
              alt="Product comparison dashboard"
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="px-6 py-24 bg-secondary">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Key Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">Compare with Confidence</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comparison tool gives you all the information you need to make the right choice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Create comprehensive product comparisons in just a few simple steps.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-muted hidden md:block" />

            <div className="space-y-12 relative">
              {steps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
};

// Feature Card Component
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: SearchCheck,
    title: "Comprehensive Analysis",
    description: "Compare up to 5 products with detailed specifications, features, and performance metrics side by side."
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Get objective comparisons based on real data, user reviews, and expert opinions for each product."
  },
  {
    icon: Zap,
    title: "Quick Decision Making",
    description: "Identify the best fit for your needs at a glance with our summary recommendations and visual indicators."
  }
];

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isVisible: boolean;
}

const FeatureCard = ({ feature, index, isVisible }: FeatureCardProps) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
};

// Step Card Component
interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Select Products",
    description: "Choose 2-5 products you want to compare from the same category."
  },
  {
    number: 2,
    title: "Customize Comparison",
    description: "Select which features and specifications matter most to you."
  },
  {
    number: 3,
    title: "Review & Share",
    description: "Get a comprehensive comparison that you can save, share, or export."
  }
];

interface StepCardProps {
  step: Step;
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={cn("md:flex items-center", isEven ? "flex-row" : "flex-row-reverse")}>
      <div className={cn("relative md:w-1/2", isEven ? "md:pr-12 text-right" : "md:pl-12")}>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm max-w-lg mx-auto md:mx-0"
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {step.number}
            </span>
          </div>
          <h3 className="text-xl font-medium mb-2">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>
        </motion.div>
      </div>
      
      <div className="hidden md:block w-8 relative z-10">
        <div className="h-8 w-8 rounded-full bg-white border-4 border-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="md:w-1/2"></div>
    </div>
  );
};

export default Index;
