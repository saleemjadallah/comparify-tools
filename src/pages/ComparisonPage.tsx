
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Award, Download, Share2, Star, CircleSlash,
  ChevronDown, ChevronUp, Check, Clock, HelpCircle, Zap
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    description: "Apple's latest flagship phone with advanced camera system",
    price: 999,
    currentPrice: 989,
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    specs: {
      display: "6.1 inch OLED ProMotion",
      processor: "A17 Pro chip",
      camera: "48MP main, 12MP ultra-wide, 12MP telephoto",
      battery: "All-day battery life",
      storage: "128GB, 256GB, 512GB, 1TB",
      dimensions: "146.7 x 71.5 x 8.25 mm",
      weight: "187g",
      waterResistance: "IP68",
      os: "iOS 17",
    },
    ratings: {
      overall: 9.2,
      design: 9.5,
      performance: 9.6,
      camera: 9.7,
      battery: 8.5,
      value: 8.0,
    },
    pros: [
      "Exceptional camera system",
      "Industry-leading performance",
      "Premium build quality",
      "Long software support",
    ],
    cons: [
      "Expensive",
      "No USB-C fast charging",
      "Limited customization options",
    ],
    bestFor: ["Photography enthusiasts", "Apple ecosystem users", "Power users"],
  },
  {
    id: "2",
    name: "Samsung Galaxy S23 Ultra",
    description: "Samsung's premium flagship with S Pen functionality",
    price: 1199,
    currentPrice: 999,
    image: "https://images.unsplash.com/photo-1678652197919-9bbe9df97e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    specs: {
      display: "6.8 inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 2",
      camera: "200MP main, 12MP ultra-wide, 10MP telephoto (3x), 10MP telephoto (10x)",
      battery: "5000mAh",
      storage: "256GB, 512GB, 1TB",
      dimensions: "163.4 x 78.1 x 8.9 mm",
      weight: "234g",
      waterResistance: "IP68",
      os: "Android 13, One UI 5.1",
    },
    ratings: {
      overall: 9.0,
      design: 8.8,
      performance: 9.4,
      camera: 9.5,
      battery: 9.2,
      value: 8.2,
    },
    pros: [
      "Versatile camera system",
      "Excellent display",
      "S Pen functionality",
      "Long battery life",
    ],
    cons: [
      "Expensive",
      "Large and heavy",
      "Slower charging than competitors",
    ],
    bestFor: ["Note users", "Photography enthusiasts", "Power users"],
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    description: "Google's AI-powered flagship with advanced computational photography",
    price: 999,
    currentPrice: 899,
    image: "https://images.unsplash.com/photo-1679755717817-cc3bc980372c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    specs: {
      display: "6.7 inch LTPO OLED",
      processor: "Google Tensor G3",
      camera: "50MP main, 48MP ultra-wide, 48MP telephoto",
      battery: "5050mAh",
      storage: "128GB, 256GB, 512GB",
      dimensions: "162.6 x 76.5 x 8.8 mm",
      weight: "213g",
      waterResistance: "IP68",
      os: "Android 14",
    },
    ratings: {
      overall: 8.8,
      design: 8.5,
      performance: 8.7,
      camera: 9.3,
      battery: 8.8,
      value: 8.5,
    },
    pros: [
      "Superior computational photography",
      "Clean Android experience",
      "Excellent display",
      "7 years of software updates",
    ],
    cons: [
      "Tensor chip less powerful than competitors",
      "Slower charging",
      "Some software quirks",
    ],
    bestFor: ["Photography enthusiasts", "Clean Android fans", "AI feature users"],
  },
];

const ComparisonPage = () => {
  const { comparisonId } = useParams();
  const [products, setProducts] = useState(mockProducts); // In a real app, fetch this based on comparisonId
  const [categoryWinners, setCategoryWinners] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [sortOrder, setSortOrder] = useState<Record<string, 'asc' | 'desc'>>({});

  useEffect(() => {
    // Calculate category winners
    const winners: Record<string, string> = {};
    
    // Overall rating winner
    const overallWinner = [...products].sort((a, b) => b.ratings.overall - a.ratings.overall)[0];
    winners.overall = overallWinner.id;
    
    // Value winner (best price to performance ratio)
    const valueWinner = [...products].sort((a, b) => 
      (b.ratings.overall / b.currentPrice) - (a.ratings.overall / a.currentPrice)
    )[0];
    winners.value = valueWinner.id;
    
    // Performance winner
    const performanceWinner = [...products].sort((a, b) => 
      b.ratings.performance - a.ratings.performance
    )[0];
    winners.performance = performanceWinner.id;
    
    // Camera winner
    const cameraWinner = [...products].sort((a, b) => 
      b.ratings.camera - a.ratings.camera
    )[0];
    winners.camera = cameraWinner.id;
    
    // Battery winner
    const batteryWinner = [...products].sort((a, b) => 
      b.ratings.battery - a.ratings.battery
    )[0];
    winners.battery = batteryWinner.id;
    
    setCategoryWinners(winners);
  }, [products]);

  // Sort products in a specific category
  const sortProducts = (category: string) => {
    const newSortOrder = sortOrder[category] === 'asc' ? 'desc' : 'asc';
    setSortOrder({ ...sortOrder, [category]: newSortOrder });
    
    const sortedProducts = [...products].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Handle different categories
      if (category === 'price') {
        valueA = a.currentPrice;
        valueB = b.currentPrice;
      } else if (category === 'name') {
        valueA = a.name;
        valueB = b.name;
        return newSortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (category.startsWith('rating.')) {
        const ratingKey = category.split('.')[1] as keyof typeof a.ratings;
        valueA = a.ratings[ratingKey];
        valueB = b.ratings[ratingKey];
      } else {
        return 0;
      }
      
      return newSortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    setProducts(sortedProducts);
  };
  
  // Function to get a label with a winner badge if applicable
  const getLabelWithBadge = (label: string, category: string, productId: string) => {
    const isWinner = categoryWinners[category] === productId;
    
    return (
      <div className="flex items-center space-x-2">
        <span>{label}</span>
        {isWinner && (
          <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Award className="mr-1 h-3 w-3" />
            Best
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.20))] flex flex-col">
      <div className="container px-4 md:px-6 py-8 flex-grow">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-2 hover:bg-transparent p-0 h-auto"
              >
                <Link to="/compare">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to builder
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Smartphone Comparison</h1>
              <p className="text-muted-foreground mt-1">
                Comparing {products.length} products • Created just now
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </header>
          
          {/* Product Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="rounded-xl overflow-hidden border bg-card shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                  />
                  {categoryWinners.overall === product.id && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Award className="mr-1 h-3 w-3" />
                      Best Overall
                    </div>
                  )}
                  {categoryWinners.value === product.id && (
                    <div className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Zap className="mr-1 h-3 w-3" />
                      Best Value
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="mb-2">
                    <h2 className="font-semibold text-xl">{product.name}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground line-through">
                        ${product.price}
                      </div>
                      <div className="text-lg font-semibold">${product.currentPrice}</div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                      <span className="font-medium">{product.ratings.overall.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Pros:</span>
                      <ul className="mt-1 ml-5 list-disc text-muted-foreground">
                        {product.pros.slice(0, 2).map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Cons:</span>
                      <ul className="mt-1 ml-5 list-disc text-muted-foreground">
                        {product.cons.slice(0, 2).map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Best for:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {product.bestFor.map((user, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-0.5 bg-secondary text-xs rounded-full"
                          >
                            {user}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Detailed Comparison Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="verdict">Verdict</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Key Differences</h2>
                  
                  <div className="space-y-8">
                    {/* Performance Comparison */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-3">
                            <h4 className="font-medium">
                              {getLabelWithBadge(product.name, 'performance', product.id)}
                            </h4>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Performance</span>
                                <span className="font-medium">{product.ratings.performance.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${product.ratings.performance * 10}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {product.specs.processor} - {product.name === "iPhone 15 Pro" 
                                ? "Excellent for demanding tasks with best-in-class single-core performance."
                                : product.name === "Samsung Galaxy S23 Ultra"
                                ? "Top-tier Android performance with excellent multi-tasking capabilities."
                                : "Good overall performance with focus on AI processing capabilities."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Camera Comparison */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Camera</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-3">
                            <h4 className="font-medium">
                              {getLabelWithBadge(product.name, 'camera', product.id)}
                            </h4>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Camera Quality</span>
                                <span className="font-medium">{product.ratings.camera.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${product.ratings.camera * 10}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {product.specs.camera} - {product.name === "iPhone 15 Pro" 
                                ? "Exceptional photography with best-in-class computational features."
                                : product.name === "Samsung Galaxy S23 Ultra"
                                ? "Versatile camera system with impressive zoom capabilities."
                                : "Superior low-light performance and AI-enhanced photography."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Battery Comparison */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Battery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-3">
                            <h4 className="font-medium">
                              {getLabelWithBadge(product.name, 'battery', product.id)}
                            </h4>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Battery Life</span>
                                <span className="font-medium">{product.ratings.battery.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${product.ratings.battery * 10}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {product.specs.battery} - {product.name === "iPhone 15 Pro" 
                                ? "Good full-day battery life with moderate use."
                                : product.name === "Samsung Galaxy S23 Ultra"
                                ? "Excellent battery life that can last up to two days with typical use."
                                : "Very good all-day battery life with adaptive battery features."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Value Comparison */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Value</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-3">
                            <h4 className="font-medium">
                              {getLabelWithBadge(product.name, 'value', product.id)}
                            </h4>
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Value Rating</span>
                                <span className="font-medium">{product.ratings.value.toFixed(1)}/10</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${product.ratings.value * 10}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${product.currentPrice} - {product.name === "iPhone 15 Pro" 
                                ? "Premium pricing but with long-term software support and excellent resale value."
                                : product.name === "Samsung Galaxy S23 Ultra"
                                ? "High initial cost but frequent discounts improve value proposition."
                                : "Best balance of features and price with excellent software support."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Specifications Tab */}
            <TabsContent value="specs" className="mt-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <ScrollArea className="max-w-full">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                    
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Specification
                          </th>
                          {products.map((product) => (
                            <th 
                              key={product.id} 
                              className="text-left py-3 px-4 font-medium"
                            >
                              {product.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>Price</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => sortProducts('price')}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              >
                                {sortOrder.price === 'asc' ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              <div className="font-medium">${product.currentPrice}</div>
                              <div className="text-sm text-muted-foreground line-through">
                                ${product.price}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Display</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.display}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Processor</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.processor}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Camera</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.camera}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Battery</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.battery}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Storage</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.storage}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Dimensions</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.dimensions}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Weight</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.weight}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Water Resistance</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.waterResistance}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-muted-foreground">Operating System</td>
                          {products.map((product) => (
                            <td key={product.id} className="py-3 px-4">
                              {product.specs.os}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features" className="mt-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Feature Comparison</h2>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Camera Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Camera System</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="space-y-2">
                              <FeatureItem
                                feature="High-resolution main camera"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "48MP main camera with quad-pixel binning"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "200MP main camera with 16-to-1 pixel binning"
                                  : "50MP main camera with 4-to-1 pixel binning"
                                }
                              />
                              <FeatureItem
                                feature="Ultra-wide camera"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "12MP with 120° field of view"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "12MP with 120° field of view"
                                  : "48MP with 126° field of view"
                                }
                              />
                              <FeatureItem
                                feature="Telephoto camera"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "12MP with 3x optical zoom"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "10MP with 3x optical zoom + 10MP with 10x optical zoom"
                                  : "48MP with 5x optical zoom"
                                }
                              />
                              <FeatureItem
                                feature="Night mode photography"
                                available={true}
                                details="Supported on all cameras"
                              />
                              <FeatureItem
                                feature="8K video recording"
                                available={product.name !== "iPhone 15 Pro"}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Not supported, max 4K at 60fps"
                                  : "Supported at 24/30fps"
                                }
                              />
                              <FeatureItem
                                feature="Pro camera controls"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Through third-party apps"
                                  : "Built into stock camera app"
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Performance Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Performance & Battery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="space-y-2">
                              <FeatureItem
                                feature="5G connectivity"
                                available={true}
                                details="Sub-6GHz and mmWave"
                              />
                              <FeatureItem
                                feature="Wi-Fi 6E/7"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Wi-Fi 6E"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "Wi-Fi 6E"
                                  : "Wi-Fi 7"
                                }
                              />
                              <FeatureItem
                                feature="Fast charging"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Up to 27W wired, 15W MagSafe"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "Up to 45W wired, 15W wireless"
                                  : "Up to 30W wired, 15W wireless"
                                }
                              />
                              <FeatureItem
                                feature="Reverse wireless charging"
                                available={product.name !== "iPhone 15 Pro"}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Not supported"
                                  : "Supported for accessories"
                                }
                              />
                              <FeatureItem
                                feature="USB-C port"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "USB 3.2 speeds"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "USB 3.2 speeds"
                                  : "USB 3.1 speeds"
                                }
                              />
                              <FeatureItem
                                feature="RAM"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "8GB"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "12GB"
                                  : "12GB"
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Software Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Software & Special Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="space-y-2">
                              <FeatureItem
                                feature="Years of OS updates"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Approximately 6+ years"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "4 years of OS updates, 5 years of security patches"
                                  : "7 years of OS and security updates"
                                }
                              />
                              <FeatureItem
                                feature="AI capabilities"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "On-device processing with limited cloud AI capabilities"
                                  : product.name === "Samsung Galaxy S23 Ultra"
                                  ? "Galaxy AI suite with on-device and cloud processing"
                                  : "Google AI with extensive image, text, and voice processing"
                                }
                              />
                              <FeatureItem
                                feature="Stylus support"
                                available={product.name === "Samsung Galaxy S23 Ultra"}
                                details={product.name === "Samsung Galaxy S23 Ultra" 
                                  ? "Built-in S Pen with low latency"
                                  : "Not supported natively"
                                }
                              />
                              <FeatureItem
                                feature="Face unlock"
                                available={true}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "3D Face ID (secure for payments)"
                                  : "2D face recognition (not secure for payments)"
                                }
                              />
                              <FeatureItem
                                feature="Fingerprint sensor"
                                available={product.name !== "iPhone 15 Pro"}
                                details={product.name === "iPhone 15 Pro" 
                                  ? "Not available"
                                  : "Ultrasonic under-display sensor"
                                }
                              />
                              <FeatureItem
                                feature="Always-on display"
                                available={true}
                                details="Configurable settings"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Verdict Tab */}
            <TabsContent value="verdict" className="mt-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Final Verdict</h2>
                  
                  <div className="space-y-8">
                    {/* Overall Ratings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Overall Ratings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{product.name}</h4>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                                <span className="font-semibold">{product.ratings.overall.toFixed(1)}</span>
                                <span className="text-muted-foreground text-sm">/10</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {Object.entries(product.ratings).map(([key, value]) => {
                                if (key === 'overall') return null;
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="capitalize">{key}</span>
                                      <span>{value.toFixed(1)}/10</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full" 
                                        style={{ width: `${value * 10}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pros and Cons */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pros and Cons</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <h4 className="font-medium">{product.name}</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-medium mb-2 text-emerald-600">Pros</div>
                                <ul className="space-y-1">
                                  {product.pros.map((pro, index) => (
                                    <li key={index} className="flex items-start text-sm">
                                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-2 text-red-600">Cons</div>
                                <ul className="space-y-1">
                                  {product.cons.map((con, index) => (
                                    <li key={index} className="flex items-start text-sm">
                                      <CircleSlash className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Best For */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Who Should Buy Each Product?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <div key={product.id} className="space-y-4">
                            <h4 className="font-medium">{product.name}</h4>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium mb-1">Best For:</div>
                              <ul className="space-y-1">
                                {product.bestFor.map((user, index) => (
                                  <li key={index} className="flex items-start text-sm">
                                    <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                    <span>{user}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="text-sm mt-3">
                              {product.name === "iPhone 15 Pro"
                                ? "The iPhone 15 Pro is the ideal choice for those already in the Apple ecosystem who prioritize camera quality and long-term software support. Its ease of use and integration with other Apple products make it perfect for users who value simplicity and reliability."
                                : product.name === "Samsung Galaxy S23 Ultra"
                                ? "The Samsung Galaxy S23 Ultra is best suited for power users who want it all: S Pen functionality, versatile cameras with exceptional zoom capabilities, and a large display. It's the ultimate productivity and creativity tool in the Android ecosystem."
                                : "The Google Pixel 8 Pro is perfect for photography enthusiasts who want the best computational photography experience and clean Android with seven years of updates. It's also ideal for those who want to be on the cutting edge of Google's AI features."
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Final Recommendation */}
                    <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                      <h3 className="text-lg font-semibold mb-3">Conclusion</h3>
                      <p className="text-muted-foreground mb-4">
                        All three smartphones are excellent flagships with distinct strengths that cater to different users:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <div className="font-medium">Best Overall</div>
                          <div className="flex items-center">
                            <Award className="h-5 w-5 text-primary mr-2" />
                            <span>{products.find(p => p.id === categoryWinners.overall)?.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            With the highest overall score, it offers the best balance of performance, features, and user experience.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium">Best Value</div>
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 text-black mr-2" />
                            <span>{products.find(p => p.id === categoryWinners.value)?.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Offers the best price-to-performance ratio and feature set for the money.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium">Most Innovative</div>
                          <div className="flex items-center">
                            <HelpCircle className="h-5 w-5 text-violet-500 mr-2" />
                            <span>Google Pixel 8 Pro</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pushes the boundaries with AI features and computational photography.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <p>
                          Your choice ultimately depends on your ecosystem preference, budget, and which specific features you prioritize. Consider your current devices, the apps you use most frequently, and how long you plan to keep your phone before making a final decision.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Feature Item Component
interface FeatureItemProps {
  feature: string;
  available: boolean;
  details?: string;
}

const FeatureItem = ({ feature, available, details }: FeatureItemProps) => {
  return (
    <div className="flex items-start">
      <div className={cn(
        "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mr-3",
        available ? "bg-emerald-50" : "bg-red-50"
      )}>
        {available ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <X className="h-3 w-3 text-red-500" />
        )}
      </div>
      <div>
        <div className="text-sm font-medium">{feature}</div>
        {details && (
          <div className="text-xs text-muted-foreground mt-0.5">{details}</div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
