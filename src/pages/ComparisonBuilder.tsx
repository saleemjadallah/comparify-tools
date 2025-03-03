import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import StepIndicator from "@/components/comparison/StepIndicator";
import CategoryStep from "@/components/comparison/CategoryStep";
import ProductsStep from "@/components/comparison/ProductsStep";
import FeaturesStep from "@/components/comparison/FeaturesStep";
import NavigationButtons from "@/components/comparison/NavigationButtons";
import { saveProduct, saveComparison } from "@/services/productService";

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
  const [isGenerating, setIsGenerating] = useState(false);

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
  const nextStep = async () => {
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
      if (featureImportance.length === 0) {
        toast({
          title: "No features selected",
          description: "Please select at least one feature for comparison.",
          variant: "destructive",
        });
        return;
      }
      
      // Set loading state
      setIsGenerating(true);
      
      try {
        // Save products to database
        const productIds = await Promise.all(
          products.map(async product => {
            // Skip if no details
            if (!product.details) {
              return null;
            }
            
            // Save product to database
            const productId = await saveProduct(product.details, category);
            if (!productId) {
              throw new Error(`Failed to save product: ${product.name}`);
            }
            
            return productId;
          })
        );
        
        // Filter out null entries
        const validProductIds = productIds.filter(Boolean) as string[];
        
        if (validProductIds.length < 2) {
          throw new Error("Not enough valid products to create a comparison");
        }
        
        // Save comparison to database
        const comparisonId = await saveComparison(category, validProductIds, featureImportance);
        
        if (!comparisonId) {
          throw new Error("Failed to create comparison");
        }
        
        // Navigate to comparison page
        navigate(`/compare/${comparisonId}`);
      } catch (error) {
        console.error("Error generating comparison:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "There was a problem generating your comparison. Please try again.",
          variant: "destructive",
        });
        // Reset loading state if there's an error
        setIsGenerating(false);
      }
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
              isLoading={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBuilder;
