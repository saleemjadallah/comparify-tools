
import { motion } from "framer-motion";
import { Check, Download, Zap, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Price plan interface
interface PricePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  features: {
    text: string;
    icon?: React.ReactNode;
  }[];
  popular?: boolean;
  cta: string;
  color: string;
  gradient: string;
}

// Price plans data
const pricePlans: PricePlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    description: "Perfect for individuals who need regular comparisons",
    price: "$18",
    duration: "per month",
    features: [
      { text: "Unlimited comparisons", icon: <Zap /> },
      { text: "Downloadable PDFs", icon: <Download /> },
      { text: "Priority support", icon: <Star /> },
      { text: "Advanced AI analysis", icon: <Zap /> },
    ],
    cta: "Get Started",
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Save 25% with our annual plan plus exclusive features",
    price: "$162",
    duration: "per year",
    features: [
      { text: "Everything in Monthly", icon: <Check /> },
      { text: "Save 25%", icon: <Star /> },
      { text: "Community comparisons", icon: <Users /> },
      { text: "Community feedback", icon: <Users /> },
    ],
    popular: true,
    cta: "Get Started",
    color: "bg-primary",
    gradient: "from-purple-500/20 to-blue-500/5",
  },
];

// Price Card Component Props
interface PriceCardProps {
  plan: PricePlan;
  index: number;
}

// Price Card Component
const PriceCard = ({ plan, index }: PriceCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden p-0.5",
        plan.popular ? "animate-ping-slow" : ""
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b",
        plan.gradient
      )} />
      
      <div className="relative bg-background rounded-lg p-6 h-full flex flex-col">
        {plan.popular && (
          <div className="absolute -top-5 right-0 left-0 flex justify-center">
            <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-white">
              <Star className="h-3.5 w-3.5 mr-1 text-yellow-300 fill-yellow-300" />
              Most Popular
            </span>
          </div>
        )}
        
        <div className="mb-4 mt-3">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{plan.price}</span>
            <span className="text-sm text-muted-foreground ml-2">{plan.duration}</span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className={cn("p-1 rounded-full", plan.color)}>
                {feature.icon || <Check className="h-4 w-4 text-white" />}
              </span>
              <span className="text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <Button 
            asChild 
            className={cn(
              "w-full rounded-full",
              plan.popular ? "bg-primary" : "bg-blue-500"
            )}
          >
            <Link to="/compare">
              {plan.cta}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const PricingSection = () => {
  return (
    <section className="px-6 py-24 bg-secondary/50">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">Choose Your Plan</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with our affordable plans and elevate your product comparison experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricePlans.map((plan, index) => (
            <PriceCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-12 text-sm text-muted-foreground">
          All plans include a 14-day money-back guarantee. No questions asked.
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
