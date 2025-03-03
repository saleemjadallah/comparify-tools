
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SearchCheck, BarChart3, Zap } from "lucide-react";

// Feature interface
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Features data
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

// Feature Card Component Props
interface FeatureCardProps {
  feature: Feature;
  index: number;
  isVisible: boolean;
}

// Feature Card Component
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

const Features = () => {
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
  );
};

export default Features;
