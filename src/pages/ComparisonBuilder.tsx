
import CategoryStep from "@/components/comparison/CategoryStep";
import ProductsStep from "@/components/comparison/ProductsStep";
import FeaturesStep from "@/components/comparison/FeaturesStep";
import ComparisonBuilderContainer from "@/components/comparison/ComparisonBuilderContainer";
import { useComparisonBuilder } from "@/hooks/useComparisonBuilder";

const ComparisonBuilder = () => {
  const {
    category,
    setCategory,
    products,
    featureImportance,
    currentStep,
    setCurrentStep, // Add this missing function
    isGenerating,
    addProduct,
    removeProduct,
    updateProductName,
    selectProduct,
    toggleFeature,
    nextStep,
    prevStep
  } = useComparisonBuilder();

  // Steps for the comparison builder
  const steps = ["Category", "Products", "Features"];

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CategoryStep 
            category={category} 
            setCategory={setCategory} 
          />
        );
      case 1:
        return (
          <ProductsStep 
            products={products}
            category={category}
            setProducts={() => {}} // Not used directly in refactored version
            updateProductName={updateProductName}
            selectProduct={selectProduct}
            removeProduct={removeProduct}
            addProduct={addProduct}
          />
        );
      case 2:
        return (
          <FeaturesStep 
            category={category}
            featureImportance={featureImportance}
            toggleFeature={toggleFeature}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ComparisonBuilderContainer
      steps={steps}
      currentStep={currentStep}
      isLoading={isGenerating}
      onStepClick={setCurrentStep}
      onNext={nextStep}
      onPrev={prevStep}
    >
      {renderStepContent()}
    </ComparisonBuilderContainer>
  );
};

export default ComparisonBuilder;
