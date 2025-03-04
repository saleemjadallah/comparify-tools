
import { 
  BatchComparisonAnalysis,
  ComparativeOverviewItem,
  SpecificationItem,
  FeaturePresence,
  PriceValueMetric,
  UserExperienceAspect,
  UseCase,
  CategoryWinner,
  PersonalizedRecommendation
} from './comparisonAnalysisTypes';
import { ProductSearchResult, Product } from '../types';
import { enhancedSpecProcessing, flattenEnhancedSpecs } from '@/utils/enhancedSpecProcessing';

/**
 * Generates a comprehensive batch comparison analysis for the given products
 */
export const generateBatchComparisonAnalysis = (
  products: ProductSearchResult[],
  category: string
): BatchComparisonAnalysis => {
  // Ensure we have at least 2 products to compare
  if (!products || products.length < 2) {
    throw new Error('At least 2 products are required for comparison');
  }

  // Generate product IDs array
  const productIds = products.map(product => product.id);

  // 1. Generate comparative overview
  const comparativeOverview = generateComparativeOverview(products);

  // 2. Generate specification parity analysis
  const specificationParity = generateSpecificationParity(products, category);

  // 3. Generate feature matrix
  const featureMatrix = generateFeatureMatrix(products, category);

  // 4. Generate price-value assessment
  const priceValueAssessment = generatePriceValueAssessment(products, category);

  // 5. Generate user experience comparison
  const userExperienceComparison = generateUserExperienceComparison(products);

  // 6. Generate use-case optimization
  const useCaseOptimization = generateUseCaseOptimization(products, category);

  // 7. Generate top-line summary
  const topLineSummary = generateTopLineSummary(products, category);

  // 8. Generate category winners
  const categoryWinners = generateCategoryWinners(products, category);

  // 9. Generate personalized recommendations
  const personalizedRecommendations = generatePersonalizedRecommendations(products, category);

  // 10. Generate confidence assessment
  const confidenceAssessment = generateConfidenceAssessment(products);

  // Combine all data into the complete analysis
  return {
    productIds,
    comparativeOverview,
    specificationParity,
    featureMatrix,
    priceValueAssessment,
    userExperienceComparison,
    useCaseOptimization,
    topLineSummary,
    categoryWinners,
    personalizedRecommendations,
    confidenceAssessment,
    createdAt: new Date().toISOString()
  };
};

/**
 * Generates a comparative overview of the products
 */
const generateComparativeOverview = (products: ProductSearchResult[]) => {
  const items: ComparativeOverviewItem[] = products.map(product => {
    // Extract key features (use first 3 features if available)
    const keyFeatures = product.features?.slice(0, 3) || 
                       [product.description?.split('.')[0] || 'No description available'];

    // Generate a quick verdict based on product specs and features
    const quickVerdict = generateQuickVerdict(product);

    return {
      productId: product.id,
      productName: product.name,
      model: extractModelFromName(product.name),
      currentPrice: product.price,
      rating: product.rating,
      reviewCount: product.top_reviews?.length || 0,
      keyFeatures,
      quickVerdict
    };
  });

  return { items };
};

/**
 * Generates specification parity analysis
 */
const generateSpecificationParity = (products: ProductSearchResult[], category: string) => {
  // Process enhanced specs for all products
  const processedProducts = products.map(product => {
    if (!product.enhancedSpecs && product.specs) {
      product.enhancedSpecs = enhancedSpecProcessing(product, category);
    }
    return product;
  });

  // Get all specification categories from processed products
  const allCategories = new Set<string>();
  processedProducts.forEach(product => {
    if (product.enhancedSpecs) {
      Object.keys(product.enhancedSpecs).forEach(category => {
        allCategories.add(category);
      });
    }
  });

  // Generate specifications for each category
  const categories = Array.from(allCategories).map(categoryName => {
    // Get all specs in this category from all products
    const allSpecsInCategory = new Set<string>();
    processedProducts.forEach(product => {
      if (product.enhancedSpecs && product.enhancedSpecs[categoryName]) {
        Object.keys(product.enhancedSpecs[categoryName]).forEach(spec => {
          allSpecsInCategory.add(spec);
        });
      }
    });

    // Create specification items
    const specifications: SpecificationItem[] = Array.from(allSpecsInCategory).map(specName => {
      const specItem: SpecificationItem = {
        name: specName,
        values: {}
      };

      // For each product, extract the specification value
      processedProducts.forEach(product => {
        if (product.enhancedSpecs && 
            product.enhancedSpecs[categoryName] && 
            product.enhancedSpecs[categoryName][specName]) {
          
          const value = product.enhancedSpecs[categoryName][specName];
          
          // Determine if this value is superior
          // This is a simplified logic - a real implementation would need more sophisticated comparison
          const isSuperior = determineSuperiorValue(
            specName, 
            value, 
            processedProducts.map(p => p.enhancedSpecs?.[categoryName]?.[specName])
          );
          
          specItem.values[product.id] = {
            value,
            isSuperior,
            isMissing: false
          };
        } else {
          // Specification is missing for this product
          specItem.values[product.id] = {
            value: '—',
            isSuperior: false,
            isMissing: true
          };
        }
      });

      // Add explanation for technical specs
      specItem.explanation = generateSpecExplanation(specName, categoryName);
      
      return specItem;
    });

    return {
      name: categoryName,
      specifications
    };
  });

  return { categories };
};

/**
 * Generates feature presence matrix
 */
const generateFeatureMatrix = (products: ProductSearchResult[], category: string) => {
  // Define common features based on product category
  const commonFeatures = getCommonFeaturesByCategory(category);
  
  // Extract unique features from product descriptions and features
  const uniqueFeatures = extractUniqueFeatures(products);
  
  // Combine common and unique features
  const allFeatures = [...commonFeatures, ...uniqueFeatures];
  
  // Create feature presence matrix
  const features: FeaturePresence[] = allFeatures.map(featureName => {
    const feature: FeaturePresence = {
      featureName,
      isStandard: commonFeatures.includes(featureName),
      isPremium: isPremiumFeature(featureName, category),
      isUnique: uniqueFeatures.includes(featureName),
      presence: {}
    };
    
    // Determine presence and quality rating for each product
    products.forEach(product => {
      const hasFeature = checkFeaturePresence(product, featureName);
      const qualityRating = hasFeature ? rateFeatureQuality(product, featureName) : undefined;
      
      feature.presence[product.id] = {
        present: hasFeature,
        qualityRating
      };
    });
    
    return feature;
  });
  
  return { features };
};

/**
 * Generates price-value assessment
 */
const generatePriceValueAssessment = (products: ProductSearchResult[], category: string) => {
  // Define price-value metrics based on product category
  const priceValueMetricNames = getPriceValueMetricsByCategory(category);
  
  // Create price-value metrics
  const metrics: PriceValueMetric[] = priceValueMetricNames.map(metricName => {
    const metric: PriceValueMetric = {
      name: metricName,
      values: {}
    };
    
    // Calculate metric values and ratings for each product
    products.forEach(product => {
      const { value, rating } = calculatePriceValueMetric(product, metricName);
      
      metric.values[product.id] = {
        value,
        rating
      };
    });
    
    return metric;
  });
  
  // Calculate cost per unit metrics (e.g., cost per GB)
  const costPerUnit = calculateCostPerUnitMetrics(products, category);
  
  // Calculate total ownership cost
  const totalOwnershipCost: Record<string, any> = {};
  products.forEach(product => {
    totalOwnershipCost[product.id] = calculateTotalOwnershipCost(product);
  });
  
  // Calculate value longevity
  const valueLongevity: Record<string, any> = {};
  products.forEach(product => {
    valueLongevity[product.id] = calculateValueLongevity(product, category);
  });
  
  // Extract warranty information
  const warranty: Record<string, any> = {};
  products.forEach(product => {
    warranty[product.id] = extractWarrantyInfo(product);
  });
  
  return {
    metrics,
    costPerUnit,
    totalOwnershipCost,
    valueLongevity,
    warranty
  };
};

/**
 * Generates user experience comparison
 */
const generateUserExperienceComparison = (products: ProductSearchResult[]) => {
  // Define user experience aspects
  const aspects = ['Ease of Use', 'Build Quality', 'Performance', 'Reliability'];
  
  // Create user experience aspects
  const userExperienceAspects: UserExperienceAspect[] = aspects.map(aspectName => {
    const aspect: UserExperienceAspect = {
      name: aspectName,
      values: {}
    };
    
    // Calculate satisfaction level, complaints, and highlights for each product
    products.forEach(product => {
      aspect.values[product.id] = calculateUserExperienceAspect(product, aspectName);
    });
    
    return aspect;
  });
  
  // Extract reliability issues
  const reliabilityIssues: Record<string, string[]> = {};
  products.forEach(product => {
    reliabilityIssues[product.id] = extractReliabilityIssues(product);
  });
  
  // Calculate customer service rating
  const customerServiceRating: Record<string, number> = {};
  products.forEach(product => {
    customerServiceRating[product.id] = calculateCustomerServiceRating(product);
  });
  
  return {
    aspects: userExperienceAspects,
    reliabilityIssues,
    customerServiceRating
  };
};

/**
 * Generates use-case optimization
 */
const generateUseCaseOptimization = (products: ProductSearchResult[], category: string) => {
  // Define common use cases based on product category
  const useCases = getUseCasesByCategory(category);
  
  // Determine the best product for each use case
  const useCaseResults: UseCase[] = useCases.map(useCase => {
    return determineUseCaseBestProduct(useCase, products, category);
  });
  
  // Determine ideal personas for each product
  const idealPersonas: Record<string, string> = {};
  products.forEach(product => {
    idealPersonas[product.id] = determineIdealPersona(product, category);
  });
  
  // Extract deal breakers for each product
  const dealBreakers: Record<string, string[]> = {};
  products.forEach(product => {
    dealBreakers[product.id] = extractDealBreakers(product, category);
  });
  
  return {
    useCases: useCaseResults,
    idealPersonas,
    dealBreakers
  };
};

/**
 * Generates top-line summary
 */
const generateTopLineSummary = (products: ProductSearchResult[], category: string): string => {
  // This would typically be a more sophisticated analysis
  // Simplified implementation for now
  const productCount = products.length;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const productNames = products.map(p => p.name).join(', ');
  
  return `This comparison analyzes ${productCount} ${categoryName} products: ${productNames}. Each product has distinct strengths in different areas, with varying price points and feature sets. The analysis covers specifications, features, price-value assessment, and user experience to help determine which product best fits specific use cases and requirements.`;
};

/**
 * Generates category winners
 */
const generateCategoryWinners = (products: ProductSearchResult[], category: string): CategoryWinner[] => {
  // Define important categories based on product type
  const categories = getImportantCategoriesByProductType(category);
  
  // Determine winner for each category
  return categories.map(categoryName => {
    return determineCategoryWinner(categoryName, products);
  });
};

/**
 * Generates personalized recommendations
 */
const generatePersonalizedRecommendations = (products: ProductSearchResult[], category: string): PersonalizedRecommendation[] => {
  // Define recommendation types
  const recommendationTypes = [
    'Best Overall',
    'Best Value',
    'Best Budget Option',
    'Best Premium Option',
    'Best for Beginners',
    'Best for Professionals'
  ];
  
  // Generate recommendation for each type
  return recommendationTypes.map(type => {
    return generateRecommendation(type, products, category);
  });
};

/**
 * Generates confidence assessment
 */
const generateConfidenceAssessment = (products: ProductSearchResult[]) => {
  // Calculate data completeness
  const dataCompleteness = calculateDataCompleteness(products);
  
  // Find incomparable specifications
  const incomparableSpecs = findIncomparableSpecifications(products);
  
  // Identify claim contradictions
  const claimContradictions = identifyClaimContradictions(products);
  
  // Identify aspects needing hands-on testing
  const needsHandsOnTesting = identifyAspectsNeedingHandsOnTesting(products);
  
  // Recommend additional research if needed
  const additionalResearchRecommended = recommendAdditionalResearch(products);
  
  return {
    dataCompletenessRating: dataCompleteness,
    incomparableSpecifications: incomparableSpecs,
    claimContradictions,
    needsHandsOnTesting,
    additionalResearchRecommended
  };
};

// Helper functions for determining winners, ratings, etc.

/**
 * Determine if a specification value is superior to others
 */
const determineSuperiorValue = (specName: string, value: string, allValues: (string | undefined)[]): boolean => {
  // This is a simplified implementation
  // A real implementation would use more sophisticated logic based on the spec type
  
  const lowerCaseSpecName = specName.toLowerCase();
  
  // For numeric values where higher is better
  if (
    lowerCaseSpecName.includes('storage') || 
    lowerCaseSpecName.includes('memory') || 
    lowerCaseSpecName.includes('resolution') ||
    lowerCaseSpecName.includes('battery') ||
    lowerCaseSpecName.includes('screen size')
  ) {
    const numericValue = extractNumericValue(value);
    if (numericValue === null) return false;
    
    // Compare with all other values
    for (const otherValue of allValues) {
      if (!otherValue) continue;
      
      const otherNumericValue = extractNumericValue(otherValue);
      if (otherNumericValue === null) continue;
      
      if (numericValue <= otherNumericValue && value !== otherValue) {
        return false;
      }
    }
    
    return true;
  }
  
  // For numeric values where lower is better
  if (
    lowerCaseSpecName.includes('weight') || 
    lowerCaseSpecName.includes('thickness') ||
    lowerCaseSpecName.includes('response time')
  ) {
    const numericValue = extractNumericValue(value);
    if (numericValue === null) return false;
    
    // Compare with all other values
    for (const otherValue of allValues) {
      if (!otherValue) continue;
      
      const otherNumericValue = extractNumericValue(otherValue);
      if (otherNumericValue === null) continue;
      
      if (numericValue >= otherNumericValue && value !== otherValue) {
        return false;
      }
    }
    
    return true;
  }
  
  // For boolean or presence values (Yes/No)
  if (
    typeof value === 'string' && 
    (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true')
  ) {
    // Check if any other product has this feature
    const hasOtherWithFeature = allValues.some(
      otherValue => 
        otherValue !== undefined && 
        otherValue !== value && 
        (otherValue.toLowerCase() === 'yes' || otherValue.toLowerCase() === 'true')
    );
    
    // It's superior if it has the feature and not everyone else does
    return !hasOtherWithFeature;
  }
  
  // Default case: not determined to be superior
  return false;
};

/**
 * Extract numeric value from a string
 */
const extractNumericValue = (value: string): number | null => {
  const match = value.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
};

/**
 * Generate an explanation for a technical specification
 */
const generateSpecExplanation = (specName: string, category: string): string => {
  // This would be a comprehensive lookup in a real implementation
  // Simplified version for now
  const explanations: Record<string, string> = {
    'Resolution': 'The number of pixels displayed on the screen. Higher numbers mean sharper images.',
    'Refresh Rate': 'How many times per second the screen updates. Higher rates mean smoother motion.',
    'RAM': 'Random Access Memory - temporary storage for running applications. More RAM allows more apps to run simultaneously.',
    'Storage': 'Space for storing files, apps, and the operating system. More storage means more content can be saved.',
    'Battery Capacity': 'Amount of electric charge a battery can deliver. Higher capacity generally means longer battery life.',
    'Processor': 'The brain of the device that executes instructions. Faster processors generally mean better performance.',
    'Weight': 'The physical weight of the device. Lower weight typically means better portability.',
  };
  
  return explanations[specName] || `${specName} - a technical specification that affects the product's performance.`;
};

/**
 * Extract model from product name
 */
const extractModelFromName = (name: string): string => {
  // Look for common model patterns (numbers and letters after brand name)
  const modelPatterns = [
    /(\w+\s+\w+\d+(\s+\w+)?)/i,  // Words followed by numbers, like "iPhone 13 Pro"
    /(\w+\d+(\s+\w+)?)/i,        // Word with numbers, like "Galaxy S22"
    /(\w+\-\w+\d+)/i,            // Hyphenated model, like "ZenBook-UX425"
  ];
  
  for (const pattern of modelPatterns) {
    const match = name.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // If no pattern matches, return the whole name
  return name;
};

/**
 * Generate a quick verdict for a product
 */
const generateQuickVerdict = (product: ProductSearchResult): string => {
  if (!product) return 'Unknown';
  
  // Use rating to influence verdict
  if (product.rating && product.rating >= 4.5) {
    return 'Excellent';
  } else if (product.rating && product.rating >= 4.0) {
    return 'Very Good';
  } else if (product.rating && product.rating >= 3.5) {
    return 'Good';
  } else if (product.rating && product.rating >= 3.0) {
    return 'Average';
  }
  
  // Fallback to price-based verdict
  if (product.price > 1000) {
    return 'Premium';
  } else if (product.price > 500) {
    return 'Mid-range';
  } else if (product.price > 200) {
    return 'Budget';
  } else {
    return 'Entry-level';
  }
};

/**
 * Get common features by product category
 */
const getCommonFeaturesByCategory = (category: string): string[] => {
  const lowerCategory = category.toLowerCase();
  
  // Define common features by category
  const categoryFeatures: Record<string, string[]> = {
    'smartphones': [
      'Touchscreen', 'Camera', 'Bluetooth', 'Wi-Fi', 'GPS',
      'USB Charging', 'Accelerometer', 'Fingerprint Scanner'
    ],
    'laptops': [
      'Keyboard', 'Trackpad', 'USB Ports', 'Webcam', 'Wi-Fi',
      'Bluetooth', 'Headphone Jack', 'Battery'
    ],
    'headphones': [
      'Audio Playback', 'Volume Control', 'Ear Cups/Buds', 
      'Bluetooth', 'Battery', 'Microphone'
    ],
    'tvs': [
      'Screen', 'Speakers', 'HDMI Ports', 'Remote Control',
      'Power Supply', 'Wall Mounting Support'
    ],
    'cameras': [
      'Image Sensor', 'Lens', 'Flash', 'Memory Card Slot',
      'Battery', 'LCD Screen'
    ]
    // Add more categories as needed
  };
  
  // Return common features for the given category, or a default set
  for (const [cat, features] of Object.entries(categoryFeatures)) {
    if (lowerCategory.includes(cat)) {
      return features;
    }
  }
  
  // Default set of features
  return ['Power Button', 'Battery/Power Supply', 'User Interface'];
};

/**
 * Extract unique features from product descriptions and feature lists
 */
const extractUniqueFeatures = (products: ProductSearchResult[]): string[] => {
  // This would be a more sophisticated NLP-based extraction in a real implementation
  // Simplified version for now
  
  console.log('Extracting unique features from products');
  const allFeatures = new Set<string>();
  const featureCounts = new Map<string, number>();
  
  // Collect all features and count occurrences
  products.forEach(product => {
    console.log(`Processing features for product: ${product.name}`);
    const productFeatures = product.features || [];
    
    if (productFeatures.length === 0) {
      console.log(`No explicit features found for product: ${product.name}`);
    } else {
      console.log(`Found ${productFeatures.length} features for product: ${product.name}`);
    }
    
    productFeatures.forEach(feature => {
      // Basic cleaning
      const cleanFeature = feature.trim().toLowerCase();
      allFeatures.add(cleanFeature);
      
      const count = featureCounts.get(cleanFeature) || 0;
      featureCounts.set(cleanFeature, count + 1);
    });
  });
  
  console.log(`Total unique features found across all products: ${allFeatures.size}`);
  
  // Log all unique features with their counts
  console.log('Feature frequency analysis:');
  const featureFrequency = Array.from(featureCounts.entries())
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count);
  
  console.log(featureFrequency.slice(0, 10)); // Log top 10 most common features
  
  // Filter for unique features (those that appear only once)
  const uniqueFeatures = Array.from(allFeatures).filter(feature => {
    return featureCounts.get(feature) === 1;
  });
  
  console.log(`Found ${uniqueFeatures.length} truly unique features (appearing in only one product)`);
  
  // Convert back to original case and return
  return uniqueFeatures.map(feature => {
    // Find the original case version
    for (const product of products) {
      const found = product.features?.find(f => f.toLowerCase() === feature);
      if (found) return found;
    }
    return feature; // Fallback
  });
};

/**
 * Determine if a feature is premium
 */
const isPremiumFeature = (featureName: string, category: string): boolean => {
  // This would be a more comprehensive mapping in a real implementation
  // Simplified version for now
  
  const lowerFeature = featureName.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  // Premium features by category
  const premiumFeatures: Record<string, string[]> = {
    'smartphones': [
      'wireless charging', 'water resistance', '5g', 'oled', 
      'facial recognition', 'quad camera', 'telephoto', 'lidar'
    ],
    'laptops': [
      'thunderbolt', 'discrete gpu', 'oled', '4k', 
      'touch screen', 'pen support', 'facial recognition'
    ],
    'headphones': [
      'active noise cancellation', 'transparency mode', 'spatial audio',
      'wireless charging', 'premium materials', 'adaptive eq'
    ],
    'tvs': [
      'oled', 'qled', 'mini-led', '8k', 'dolby vision',
      'dolby atmos', '120hz', 'hdmi 2.1'
    ]
    // Add more categories as needed
  };
  
  // Check if the feature is premium for the given category
  for (const [cat, features] of Object.entries(premiumFeatures)) {
    if (lowerCategory.includes(cat)) {
      return features.some(f => lowerFeature.includes(f));
    }
  }
  
  // Default premium feature detection
  const generalPremiumKeywords = [
    'premium', 'professional', 'pro', 'elite', 'advanced',
    'high-end', 'luxury', 'exclusive', 'flagship'
  ];
  
  return generalPremiumKeywords.some(keyword => lowerFeature.includes(keyword));
};

/**
 * Check if a product has a specific feature
 */
const checkFeaturePresence = (product: ProductSearchResult, featureName: string): boolean => {
  if (!product) return false;
  
  const lowerFeature = featureName.toLowerCase();
  
  // Check in features array
  if (product.features && product.features.length > 0) {
    const hasFeature = product.features.some(
      feature => feature.toLowerCase().includes(lowerFeature)
    );
    if (hasFeature) return true;
  }
  
  // Check in description
  if (product.description && product.description.toLowerCase().includes(lowerFeature)) {
    return true;
  }
  
  // Check in rich product description
  if (product.rich_product_description && product.rich_product_description.length > 0) {
    const hasFeature = product.rich_product_description.some(
      desc => desc.toLowerCase().includes(lowerFeature)
    );
    if (hasFeature) return true;
  }
  
  // Check in specifications
  if (product.specs) {
    const allSpecs = flattenEnhancedSpecs(product.enhancedSpecs || {});
    const specValues = Object.values(allSpecs).join(' ').toLowerCase();
    if (specValues.includes(lowerFeature)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Rate feature quality for a product (1-5 scale)
 */
const rateFeatureQuality = (product: ProductSearchResult, featureName: string): number => {
  // This would be a more sophisticated analysis in a real implementation
  // Simplified version for now - returns 3 (average) by default
  return 3;
};

/**
 * Get price-value metrics by product category
 */
const getPriceValueMetricsByCategory = (category: string): string[] => {
  const lowerCategory = category.toLowerCase();
  
  // Define price-value metrics by category
  const categoryMetrics: Record<string, string[]> = {
    'smartphones': [
      'Price to Performance Ratio', 'Price per GB Storage',
      'Camera Quality per Dollar', 'Battery Life per Dollar'
    ],
    'laptops': [
      'Price to Performance Ratio', 'Price per GB RAM',
      'Price per GB Storage', 'Display Quality per Dollar'
    ],
    'headphones': [
      'Sound Quality per Dollar', 'Comfort per Dollar',
      'Battery Life per Dollar', 'Feature Set per Dollar'
    ],
    'tvs': [
      'Price per Inch', 'Picture Quality per Dollar',
      'Smart Features per Dollar', 'HDR Performance per Dollar'
    ]
    // Add more categories as needed
  };
  
  // Return metrics for the given category, or a default set
  for (const [cat, metrics] of Object.entries(categoryMetrics)) {
    if (lowerCategory.includes(cat)) {
      return metrics;
    }
  }
  
  // Default metrics
  return ['Value for Money', 'Feature Set per Dollar', 'Quality per Dollar'];
};

/**
 * Calculate a specific price-value metric for a product
 */
const calculatePriceValueMetric = (product: ProductSearchResult, metricName: string): { value: number | string; rating: number } => {
  // This would be a more sophisticated calculation in a real implementation
  // Simplified version for now - returns placeholder data
  
  return {
    value: `${(Math.random() * 10).toFixed(2)}`,
    rating: Math.floor(Math.random() * 5) + 1
  };
};

/**
 * Calculate cost per unit metrics
 */
const calculateCostPerUnitMetrics = (products: ProductSearchResult[], category: string) => {
  const lowerCategory = category.toLowerCase();
  
  // Define units by category
  const categoryUnits: Record<string, string[]> = {
    'smartphones': ['GB Storage', 'MP Camera'],
    'laptops': ['GB RAM', 'GB Storage', 'GHz Processor'],
    'tvs': ['Inch Screen'],
    'storage': ['GB Storage', 'MB/s Transfer Speed'],
    'monitors': ['Inch Screen', 'Hz Refresh Rate']
    // Add more categories as needed
  };
  
  // Use appropriate units for the category, or a default
  let units: string[] = ['Feature'];
  for (const [cat, catUnits] of Object.entries(categoryUnits)) {
    if (lowerCategory.includes(cat)) {
      units = catUnits;
      break;
    }
  }
  
  // Calculate cost per unit for each product and unit
  return units.map(unit => {
    // This would extract real values in a full implementation
    const values: Record<string, number> = {};
    
    products.forEach(product => {
      // Assign random placeholder values
      values[product.id] = Math.random() * 100;
    });
    
    return {
      unitName: unit,
      values
    };
  });
};

/**
 * Calculate total ownership cost for a product
 */
const calculateTotalOwnershipCost = (product: ProductSearchResult) => {
  // This would calculate real costs in a full implementation
  // Simplified version with placeholder data
  
  const basePrice = product.price;
  const accessories = Math.round(basePrice * 0.2); // Assume 20% of base price for accessories
  const subscriptions = Math.round(basePrice * 0.1); // Assume 10% of base price for subscriptions
  
  return {
    basePrice,
    accessories,
    subscriptions,
    total: basePrice + accessories + subscriptions
  };
};

/**
 * Calculate value longevity for a product
 */
const calculateValueLongevity = (product: ProductSearchResult, category: string) => {
  // This would be based on real data in a full implementation
  // Simplified version with placeholder data
  
  // Random rating between 1 and 5
  const rating = Math.floor(Math.random() * 5) + 1;
  
  // Generate generic explanation
  let explanation = 'Average value retention over time.';
  if (rating >= 4) {
    explanation = 'Excellent value retention due to brand reputation and build quality.';
  } else if (rating <= 2) {
    explanation = 'Poor value retention due to rapid technology advancement and build concerns.';
  }
  
  return {
    rating,
    explanation
  };
};

/**
 * Extract warranty information for a product
 */
const extractWarrantyInfo = (product: ProductSearchResult) => {
  // This would extract real warranty info in a full implementation
  // Simplified version with placeholder data
  
  return {
    coverage: 'Limited manufacturer warranty',
    durationMonths: 12, // Standard 1-year warranty
    quality: 3 // Average rating
  };
};

/**
 * Calculate user experience aspect for a product
 */
const calculateUserExperienceAspect = (product: ProductSearchResult, aspectName: string) => {
  // This would be based on real review data in a full implementation
  // Simplified version with placeholder data
  
  // Random satisfaction level between 1 and 5
  const satisfactionLevel = Math.floor(Math.random() * 5) + 1;
  
  // Generic complaints and highlights
  const commonComplaints = [
    'Could be better for the price',
    'Setup is complicated',
    'Instructions are unclear'
  ];
  
  const positiveHighlights = [
    'Exceeds expectations',
    'Easy to use',
    'Great design'
  ];
  
  return {
    satisfactionLevel,
    commonComplaints,
    positiveHighlights
  };
};

/**
 * Extract reliability issues for a product
 */
const extractReliabilityIssues = (product: ProductSearchResult): string[] => {
  // This would extract real issues from reviews in a full implementation
  // Simplified version with placeholder data
  
  return [
    'Occasional software glitches',
    'Battery degradation over time',
    'Minor construction concerns'
  ];
};

/**
 * Calculate customer service rating for a product
 */
const calculateCustomerServiceRating = (product: ProductSearchResult): number => {
  // This would be based on real review data in a full implementation
  // Simplified version - returns random rating between 1 and 5
  return Math.floor(Math.random() * 5) + 1;
};

/**
 * Get use cases by product category
 */
const getUseCasesByCategory = (category: string): string[] => {
  const lowerCategory = category.toLowerCase();
  
  // Define use cases by category
  const categoryUseCases: Record<string, string[]> = {
    'smartphones': [
      'Photography', 'Gaming', 'Business Use', 'Social Media',
      'Battery Life', 'Durability', 'Value for Money'
    ],
    'laptops': [
      'Professional Work', 'Creative Tasks', 'Gaming',
      'Student Use', 'Travel', 'Battery Life', 'Value for Money'
    ],
    'headphones': [
      'Audio Quality', 'Noise Cancellation', 'Exercise Use',
      'Commuting', 'Professional Use', 'Comfort for Long Sessions'
    ],
    'tvs': [
      'Movie Watching', 'Sports Viewing', 'Gaming',
      'Bright Room Use', 'Small Space', 'Large Room'
    ]
    // Add more categories as needed
  };
  
  // Return use cases for the given category, or a default set
  for (const [cat, useCases] of Object.entries(categoryUseCases)) {
    if (lowerCategory.includes(cat)) {
      return useCases;
    }
  }
  
  // Default use cases
  return ['Everyday Use', 'Professional Use', 'Value for Money', 'Premium Experience'];
};

/**
 * Determine the best product for a specific use case
 */
const determineUseCaseBestProduct = (useCase: string, products: ProductSearchResult[], category: string): UseCase => {
  // This would be a sophisticated analysis in a full implementation
  // Simplified version - returns random product as winner
  
  // Random selection for demo purposes
  const randomIndex = Math.floor(Math.random() * products.length);
  const bestProduct = products[randomIndex];
  
  // Pick a different second best (if possible)
  let secondBestIndex = (randomIndex + 1) % products.length;
  if (secondBestIndex === randomIndex) secondBestIndex = undefined;
  
  const secondBestProduct = secondBestIndex !== undefined ? products[secondBestIndex] : undefined;
  
  return {
    name: useCase,
    bestProductId: bestProduct.id,
    secondBestProductId: secondBestProduct?.id,
    reasoning: `${bestProduct.name} performs best for ${useCase} due to its specifications and features.`
  };
};

/**
 * Determine ideal persona for a product
 */
const determineIdealPersona = (product: ProductSearchResult, category: string): string => {
  // This would be a more sophisticated analysis in a real implementation
  // Simplified version with generic personas
  
  // Random selection for demo purposes
  const personas = [
    'Technology enthusiasts who value the latest features',
    'Budget-conscious consumers looking for value',
    'Professionals who need reliability and performance',
    'Casual users who prioritize ease of use',
    'Creative professionals who need specialized features'
  ];
  
  const randomIndex = Math.floor(Math.random() * personas.length);
  return personas[randomIndex];
};

/**
 * Extract deal breakers for a product
 */
const extractDealBreakers = (product: ProductSearchResult, category: string): string[] => {
  // This would extract real deal breakers in a full implementation
  // Simplified version with placeholder data
  
  return [
    'Limited expandability options',
    'Higher price point than competitors',
    'No included accessories'
  ];
};

/**
 * Get important categories by product type
 */
const getImportantCategoriesByProductType = (category: string): string[] => {
  const lowerCategory = category.toLowerCase();
  
  // Define important categories by product type
  const productTypeCategories: Record<string, string[]> = {
    'smartphones': [
      'Performance', 'Camera Quality', 'Battery Life',
      'Display Quality', 'Build Quality', 'Software Experience'
    ],
    'laptops': [
      'Performance', 'Battery Life', 'Display Quality',
      'Keyboard & Trackpad', 'Portability', 'Value for Money'
    ],
    'headphones': [
      'Sound Quality', 'Comfort', 'Noise Cancellation',
      'Battery Life', 'Build Quality', 'Connectivity'
    ],
    'tvs': [
      'Picture Quality', 'Smart Features', 'Gaming Performance',
      'Sound Quality', 'Design', 'Value for Money'
    ]
    // Add more product types as needed
  };
  
  // Return categories for the given product type, or a default set
  for (const [type, categories] of Object.entries(productTypeCategories)) {
    if (lowerCategory.includes(type)) {
      return categories;
    }
  }
  
  // Default categories
  return ['Performance', 'Quality', 'Features', 'Design', 'Value for Money'];
};

/**
 * Determine the winner for a specific category
 */
const determineCategoryWinner = (categoryName: string, products: ProductSearchResult[]): CategoryWinner => {
  // This would be a sophisticated analysis in a full implementation
  // Simplified version - returns random product as winner
  
  // Random selection for demo purposes
  const randomIndex = Math.floor(Math.random() * products.length);
  const winner = products[randomIndex];
  
  return {
    categoryName,
    winnerId: winner.id,
    reasoning: `${winner.name} excels in ${categoryName} due to its superior specifications and features.`,
    advantageSignificance: Math.floor(Math.random() * 3) + 3, // Random 3-5
    relevanceToMostUsers: Math.floor(Math.random() * 3) + 3 // Random 3-5
  };
};

/**
 * Generate a recommendation for a specific type
 */
const generateRecommendation = (type: string, products: ProductSearchResult[], category: string): PersonalizedRecommendation => {
  // This would be a sophisticated analysis in a full implementation
  // Simplified version - returns random product as recommendation
  
  // Random selection for demo purposes
  const randomIndex = Math.floor(Math.random() * products.length);
  const recommendedProduct = products[randomIndex];
  
  return {
    recommendationType: type,
    productId: recommendedProduct.id,
    reasoning: `${recommendedProduct.name} is the ${type} because of its balance of features, performance, and price.`
  };
};

/**
 * Calculate data completeness rating
 */
const calculateDataCompleteness = (products: ProductSearchResult[]): number => {
  // This would be a more sophisticated calculation in a real implementation
  // Simplified version - returns random rating between 3 and 5
  return Math.floor(Math.random() * 3) + 3;
};

/**
 * Find specifications that can't be directly compared
 */
const findIncomparableSpecifications = (products: ProductSearchResult[]): string[] => {
  // This would find real incomparable specs in a full implementation
  // Simplified version with placeholder data
  
  return [
    'Proprietary features',
    'Brand-specific technologies',
    'Software experience'
  ];
};

/**
 * Identify contradictions between manufacturer claims and user experiences
 */
const identifyClaimContradictions = (products: ProductSearchResult[]): any[] => {
  // This would find real contradictions in a full implementation
  // Simplified version with placeholder data
  
  return products.map(product => ({
    productId: product.id,
    claim: 'Long battery life',
    contradiction: 'Some users report shorter than claimed battery life'
  }));
};

/**
 * Identify aspects that need hands-on testing
 */
const identifyAspectsNeedingHandsOnTesting = (products: ProductSearchResult[]): string[] => {
  // This would identify real aspects in a full implementation
  // Simplified version with placeholder data
  
  return [
    'Real-world performance',
    'Build quality feel',
    'Display quality in different lighting',
    'Actual battery life'
  ];
};

/**
 * Recommend additional research
 */
const recommendAdditionalResearch = (products: ProductSearchResult[]): string[] => {
  // This would recommend real research in a full implementation
  // Simplified version with placeholder data
  
  return [
    'Long-term reliability reports',
    'Professional reviews with benchmarks',
    'Customer service quality for each brand',
    'Video demonstrations of key features'
  ];
};

// Export additional helper functions for UI components to use
export const extractQuickComparison = (
  analysis: BatchComparisonAnalysis
): { titles: string[]; rows: { name: string; values: string[] }[] } => {
  if (!analysis) return { titles: [], rows: [] };
  
  // Extract product names for the table headers
  const titles = analysis.comparativeOverview.items.map(item => item.productName);
  
  // Create key rows from the analysis
  const rows = [
    {
      name: 'Price',
      values: analysis.comparativeOverview.items.map(item => `$${item.currentPrice}`)
    },
    {
      name: 'Rating',
      values: analysis.comparativeOverview.items.map(item => 
        item.rating ? `${item.rating}/5` : 'N/A'
      )
    },
    {
      name: 'Verdict',
      values: analysis.comparativeOverview.items.map(item => item.quickVerdict)
    }
  ];
  
  // Add top 3 key features for each product
  for (let i = 0; i < 3; i++) {
    rows.push({
      name: `Feature ${i + 1}`,
      values: analysis.comparativeOverview.items.map(item => 
        item.keyFeatures && item.keyFeatures.length > i ? item.keyFeatures[i] : 'N/A'
      )
    });
  }
  
  return { titles, rows };
};
