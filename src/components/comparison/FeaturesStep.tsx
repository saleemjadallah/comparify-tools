
import { motion } from "framer-motion";
import { getFeaturesByCategory } from "@/utils/comparisonUtils";
import FeatureItem from "./FeatureItem";

interface FeaturesStepProps {
  category: string;
  featureImportance: string[];
  toggleFeature: (feature: string) => void;
}

const FeaturesStep = ({ category, featureImportance, toggleFeature }: FeaturesStepProps) => {
  const features = getFeaturesByCategory(category);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Select Important Features</h2>
        <p className="text-muted-foreground">
          Choose which features are most important to you in this comparison.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature) => (
            <FeatureItem
              key={feature}
              feature={feature}
              isSelected={featureImportance.includes(feature)}
              onClick={() => toggleFeature(feature)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturesStep;
