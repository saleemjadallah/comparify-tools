
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, X, ArrowRight, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Product categories
const productCategories = [
  "Smartphones",
  "Laptops",
  "Headphones",
  "TVs",
  "Cameras",
  "Smartwatches",
  "Gaming Consoles",
  "Smart Home Devices",
  "Tablets",
];

const ComparisonBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Array<{ name: string; id: string }>>([
    { name: "", id: "1" },
    { name: "", id: "2" },
  ]);
  const [featureImportance, setFeatureImportance] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Add a new product
  const addProduct = () => {
    if (products.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can compare up to 5 products at a time.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts([...products, { name: "", id: crypto.randomUUID() }]);
  };

  // Remove a product
  const removeProduct = (id: string) => {
    if (products.length <= 2) {
      toast({
        title: "Minimum requirement",
        description: "You need at least 2 products to compare.",
        variant: "destructive",
      });
      return;
    }
    
    setProducts(products.filter(product => product.id !== id));
  };

  // Update product name
  const updateProductName = (id: string, name: string) => {
    setProducts(
      products.map(product => 
        product.id === id ? { ...product, name } : product
      )
    );
  };

  // Toggle feature importance
  const toggleFeature = (feature: string) => {
    setFeatureImportance(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep === 0 && !category) {
      toast({
        title: "Please select a category",
        description: "You need to select a product category before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 1 && products.some(p => !p.name)) {
      toast({
        title: "Missing product names",
        description: "Please fill in all product names before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate comparison ID and navigate
      const comparisonId = crypto.randomUUID().slice(0, 8);
      navigate(`/compare/${comparisonId}`);
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.20))] flex flex-col">
      <div className="flex-grow px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between w-full relative">
              <div className="absolute top-1/2 h-0.5 w-full bg-muted -z-10"></div>
              {["Category", "Products", "Features"].map((step, index) => (
                <button
                  key={step}
                  className={cn(
                    "flex flex-col items-center space-y-2",
                    currentStep === index || currentStep > index
                      ? "opacity-100"
                      : "opacity-60"
                  )}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                      currentStep === index
                        ? "bg-primary text-primary-foreground scale-110 shadow-md"
                        : currentStep > index
                        ? "bg-primary/80 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            {/* Step 1: Category Selection */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Select a Product Category</h2>
                  <p className="text-muted-foreground">
                    Choose the category for the products you want to compare.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Product Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Product Selection */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Add Products to Compare</h2>
                  <p className="text-muted-foreground">
                    Enter the names or models of the products you want to compare (2-5 products).
                  </p>
                </div>

                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <div className="flex-grow">
                        <Label htmlFor={`product-${index}`} className="sr-only">
                          Product {index + 1}
                        </Label>
                        <Input
                          id={`product-${index}`}
                          placeholder={`Product ${index + 1} name or model`}
                          value={product.name}
                          onChange={(e) => updateProductName(product.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                        disabled={products.length <= 2}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove product</span>
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addProduct}
                    disabled={products.length >= 5}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Product
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Feature Importance */}
            {currentStep === 2 && (
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
                    {getFeaturesByCategory(category).map((feature) => (
                      <div
                        key={feature}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all-200",
                          featureImportance.includes(feature)
                            ? "bg-primary/5 border-primary/30"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleFeature(feature)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{feature}</span>
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full border",
                              featureImportance.includes(feature)
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            )}
                          >
                            {featureImportance.includes(feature) && (
                              <div className="h-full w-full flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={nextStep}>
                {currentStep < 2 ? (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Generate Comparison"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get features based on category
const getFeaturesByCategory = (category: string): string[] => {
  const commonFeatures = [
    "Price",
    "Value for Money",
    "Build Quality",
    "Design",
    "User Experience",
    "Customer Support",
    "Warranty",
  ];

  const categoryFeatures: Record<string, string[]> = {
    "Smartphones": [
      "Performance",
      "Battery Life",
      "Camera Quality",
      "Display",
      "Software",
      "Storage",
      "5G Connectivity",
    ],
    "Laptops": [
      "Performance",
      "Battery Life",
      "Display Quality",
      "Keyboard",
      "Portability",
      "Storage",
      "Connectivity",
    ],
    "Headphones": [
      "Sound Quality",
      "Noise Cancellation",
      "Battery Life",
      "Comfort",
      "Connectivity",
      "Durability",
      "Portability",
    ],
    "TVs": [
      "Picture Quality",
      "Sound Quality",
      "Smart Features",
      "Connectivity",
      "Screen Size",
      "Refresh Rate",
      "HDR Support",
    ],
    "Cameras": [
      "Image Quality",
      "Video Quality",
      "Autofocus",
      "Low Light Performance",
      "Battery Life",
      "Portability",
      "Durability",
    ],
    "Smartwatches": [
      "Battery Life",
      "Health Features",
      "Display",
      "Connectivity",
      "App Ecosystem",
      "Durability",
      "Water Resistance",
    ],
    "Gaming Consoles": [
      "Performance",
      "Game Library",
      "Online Services",
      "Controller",
      "Storage",
      "Multimedia Features",
      "Portability",
    ],
    "Smart Home Devices": [
      "Integration",
      "Voice Control",
      "Setup Ease",
      "Automation Features",
      "Privacy",
      "Connectivity",
      "App Quality",
    ],
    "Tablets": [
      "Performance",
      "Display",
      "Battery Life",
      "Portability",
      "Pen Support",
      "Storage",
      "App Ecosystem",
    ],
  };

  return category && categoryFeatures[category]
    ? [...categoryFeatures[category], ...commonFeatures]
    : commonFeatures;
};

export default ComparisonBuilder;
