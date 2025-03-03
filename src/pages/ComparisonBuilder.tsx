
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import StepIndicator from "@/components/comparison/StepIndicator";
import CategoryStep from "@/components/comparison/CategoryStep";
import ProductsStep from "@/components/comparison/ProductsStep";
import FeaturesStep from "@/components/comparison/FeaturesStep";
import NavigationButtons from "@/components/comparison/NavigationButtons";

const ComparisonBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Array<{ name: string; id: string; details?: any }>>([
    { name: "", id: "1" },
    { name: "", id: "2" },
  ]);
  const [featureImportance, setFeatureImportance] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Steps for the comparison builder
  const steps = ["Category", "Products", "Features"];

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

  // Select product from search results
  const selectProduct = (product: any, productIndex: number) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      id: updatedProducts[productIndex].id,
      name: product.name,
      details: product
    };
    
    setProducts(updatedProducts);
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
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={(index) => index < currentStep && setCurrentStep(index)} 
          />

          {/* Step Content */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            {/* Step 1: Category Selection */}
            {currentStep === 0 && (
              <CategoryStep 
                category={category} 
                setCategory={setCategory} 
              />
            )}

            {/* Step 2: Product Selection */}
            {currentStep === 1 && (
              <ProductsStep 
                products={products}
                category={category}
                setProducts={setProducts}
                updateProductName={updateProductName}
                selectProduct={selectProduct}
                removeProduct={removeProduct}
                addProduct={addProduct}
              />
            )}

            {/* Step 3: Feature Importance */}
            {currentStep === 2 && (
              <FeaturesStep 
                category={category}
                featureImportance={featureImportance}
                toggleFeature={toggleFeature}
              />
            )}

            {/* Navigation Buttons */}
            <NavigationButtons 
              currentStep={currentStep}
              totalSteps={steps.length}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBuilder;
