
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, X, ArrowRight, Search } from "lucide-react";
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

// Mock product database for search functionality
const mockProductDatabase = {
  "Smartphones": [
    { id: "s1", name: "iPhone 14 Pro", brand: "Apple", price: 999 },
    { id: "s2", name: "Samsung Galaxy S23", brand: "Samsung", price: 799 },
    { id: "s3", name: "Google Pixel 7", brand: "Google", price: 599 },
    { id: "s4", name: "OnePlus 11", brand: "OnePlus", price: 699 },
  ],
  "Laptops": [
    { id: "l1", name: "MacBook Pro 14\"", brand: "Apple", price: 1999 },
    { id: "l2", name: "Dell XPS 13", brand: "Dell", price: 1299 },
    { id: "l3", name: "Lenovo ThinkPad X1", brand: "Lenovo", price: 1499 },
    { id: "l4", name: "HP Spectre x360", brand: "HP", price: 1399 },
  ],
  "Headphones": [
    { id: "h1", name: "AirPods Pro", brand: "Apple", price: 249 },
    { id: "h2", name: "Sony WH-1000XM5", brand: "Sony", price: 399 },
    { id: "h3", name: "Bose QuietComfort", brand: "Bose", price: 329 },
    { id: "h4", name: "Sennheiser Momentum 4", brand: "Sennheiser", price: 349 },
  ],
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Handle product search
  const handleSearch = (query: string, productIndex: number) => {
    setSearchQuery(query);
    
    if (query.length < 2 || !category) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter products based on the query and selected category
    const categoryProducts = mockProductDatabase[category as keyof typeof mockProductDatabase] || [];
    const results = categoryProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
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
    setShowSearchResults(false);
    setSearchQuery("");
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
                    <div key={product.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-grow relative">
                          <Label htmlFor={`product-${index}`} className="sr-only">
                            Product {index + 1}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`product-${index}`}
                              placeholder={`Product ${index + 1} name or model`}
                              value={product.name}
                              onChange={(e) => {
                                updateProductName(product.id, e.target.value);
                                handleSearch(e.target.value, index);
                              }}
                              className="w-full pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          {/* Search Results Dropdown */}
                          {showSearchResults && index === products.findIndex(p => !p.name || p.name === searchQuery) && (
                            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border z-50 max-h-64 overflow-auto">
                              {searchResults.map((result) => (
                                <div
                                  key={result.id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                                  onClick={() => selectProduct(result, index)}
                                >
                                  <div>
                                    <div className="font-medium">{result.name}</div>
                                    <div className="text-sm text-muted-foreground">{result.brand}</div>
                                  </div>
                                  <div className="text-sm font-medium">${result.price}</div>
                                </div>
                              ))}
                            </div>
                          )}
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
                      
                      {/* Product Details (if selected from search) */}
                      {product.details && (
                        <div className="ml-2 pl-3 border-l-2 border-primary/20 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{product.details.brand}</span>
                            {' • '}${product.details.price}
                          </div>
                        </div>
                      )}
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
