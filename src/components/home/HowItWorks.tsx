
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Step interface
interface Step {
  number: number;
  title: string;
  description: string;
}

// Steps data
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

// Step Card Component Props
interface StepCardProps {
  step: Step;
  index: number;
}

// Step Card Component
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

const HowItWorks = () => {
  return (
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
  );
};

export default HowItWorks;
