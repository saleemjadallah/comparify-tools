import { logger } from "./logging";
import { enhancedSpecProcessing } from "@/utils/enhancedSpecs";

/**
 * Extracts key technical specifications from product data
 */
const extractKeyTechnicalSpecs = (product: any): Record<string, string> => {
  const result: Record<string, string> = {};
  
  // Helper function to extract values based on key patterns
  const extractByPattern = (data: Record<string, any>, patterns: string[][], targetKey: string) => {
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      for (const pattern of patterns) {
        if (pattern.some(p => lowerKey.includes(p))) {
          result[targetKey] = typeof value === 'string' ? value : JSON.stringify(value);
          return true;
        }
      }
    }
    return false;
  };
  
  // Define common spec patterns to look for
  const processorPatterns = [['processor', 'cpu'], ['chip', 'chipset'], ['snapdragon', 'exynos', 'bionic']];
  const memoryPatterns = [['memory', 'ram'], ['ddr', 'dimm']];
  const storagePatterns = [['storage', 'disk'], ['ssd', 'hdd', 'drive']];
  const displayPatterns = [['display', 'screen'], ['lcd', 'oled', 'retina']];
  const batteryPatterns = [['battery'], ['power', 'mah']];
  const cameraPatterns = [['camera'], ['mp', 'megapixel', 'lens']];
  
  // Start with specs object
  if (product.specs && typeof product.specs === 'object') {
    extractByPattern(product.specs, processorPatterns, 'processor');
    extractByPattern(product.specs, memoryPatterns, 'memory');
    extractByPattern(product.specs, storagePatterns, 'storage');
    extractByPattern(product.specs, displayPatterns, 'display');
    extractByPattern(product.specs, batteryPatterns, 'battery');
    extractByPattern(product.specs, cameraPatterns, 'camera');
  }
  
  // Try specifications_flat if available
  if (product.specifications_flat && typeof product.specifications_flat === 'object') {
    extractByPattern(product.specifications_flat, processorPatterns, 'processor');
    extractByPattern(product.specifications_flat, memoryPatterns, 'memory');
    extractByPattern(product.specifications_flat, storagePatterns, 'storage');
    extractByPattern(product.specifications_flat, displayPatterns, 'display');
    extractByPattern(product.specifications_flat, batteryPatterns, 'battery');
    extractByPattern(product.specifications_flat, cameraPatterns, 'camera');
  }
  
  // Try technical_details if available
  if (product.technical_details && typeof product.technical_details === 'object') {
    extractByPattern(product.technical_details, processorPatterns, 'processor');
    extractByPattern(product.technical_details, memoryPatterns, 'memory');
    extractByPattern(product.technical_details, storagePatterns, 'storage');
    extractByPattern(product.technical_details, displayPatterns, 'display');
    extractByPattern(product.technical_details, batteryPatterns, 'battery');
    extractByPattern(product.technical_details, cameraPatterns, 'camera');
  }
  
  // Check features text for mentions of key specs
  if (product.features && Array.isArray(product.features)) {
    const allFeatures = product.features.join(' ').toLowerCase();
    
    // Look for processor information in text
    if (!result.processor) {
      const processorMatch = allFeatures.match(/(?:powered by|features|with|using) (?:an?|the) ([\w\s\d]+ processor|[\w\s\d]+ cpu|snapdragon \d+|exynos \d+|a\d+ bionic|intel [^\s]+|amd [^\s]+)/i);
      if (processorMatch && processorMatch[1]) {
        result.processor = processorMatch[1];
      }
    }
    
    // Look for memory information in text
    if (!result.memory) {
      const memoryMatch = allFeatures.match(/(\d+\s*(?:gb|gigabytes?|gigs?)) (?:of)? (?:memory|ram)/i);
      if (memoryMatch && memoryMatch[1]) {
        result.memory = memoryMatch[1];
      }
    }
    
    // Look for storage information in text
    if (!result.storage) {
      const storageMatch = allFeatures.match(/(\d+\s*(?:gb|tb|gigabytes?|terabytes?)) (?:of)? (?:storage|ssd|hard drive|hdd)/i);
      if (storageMatch && storageMatch[1]) {
        result.storage = storageMatch[1];
      }
    }
  }
  
  logger.debug(`Extracted key tech specs: ${Object.keys(result).join(', ')}`);
  return result;
};

/**
 * Prepares product data for analysis, ensuring required fields are present
 */
export const prepareProductData = (products: any[]): any[] => {
  logger.info(`Preparing ${products.length} products for analysis`);
  
  return products.map(product => {
    // Extract key technical specifications
    const keyTechSpecs = extractKeyTechnicalSpecs(product);
    
    // Combine all possible specification sources
    const combinedSpecs = {
      ...(product.specs || {}),
      ...(product.specifications_flat || {}),
      ...(product.technical_details || {}),
      ...keyTechSpecs
    };
    
    // Find the best feature list from all available sources
    let bestFeatures = [];
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      bestFeatures = product.features;
    } else if (product.feature_bullets_flat && Array.isArray(product.feature_bullets_flat) && product.feature_bullets_flat.length > 0) {
      bestFeatures = product.feature_bullets_flat;
    } else if (product.rich_product_description && Array.isArray(product.rich_product_description) && product.rich_product_description.length > 0) {
      bestFeatures = product.rich_product_description;
    }
    
    // Create a base product object with essential fields
    const productInfo = {
      name: product.name,
      brand: product.brand || 'Unknown',
      price: product.price || 'Unknown',
      specs: combinedSpecs,
      id: product.id || crypto.randomUUID(),
      
      // These are the three key fields from Rainforest API we want to focus on
      description: product.description || '',
      features: bestFeatures,
      rich_product_description: product.rich_product_description || [],
      
      // Include enhanced specs if available
      enhancedSpecs: product.enhancedSpecs || {},
      
      // Include key technical specs explicitly
      keyTechSpecs: keyTechSpecs,
      
      // Include metadata about data quality
      meta: product.meta || {
        data_quality_score: 0,
        has_description: !!product.description,
        has_features: bestFeatures.length > 0,
        has_specs: Object.keys(combinedSpecs).length > 0
      },
      
      // Include raw data for access to all available fields
      rawData: {
        ...product,
        // Explicitly map the key Rainforest API fields we want to focus on
        description: product.description || '',
        feature_bullets_flat: bestFeatures,
        specifications_flat: combinedSpecs,
        specifications: product.specifications || [],
        technical_details: product.technical_details || {},
        dimensions: product.dimensions || {},
        keyTechSpecs: keyTechSpecs
      }
    };
    
    logProductData(product, productInfo);
    
    return productInfo;
  });
};

/**
 * Logs prepared product data for debugging
 */
const logProductData = (product: any, productInfo: any): void => {
  const hasDescription = !!productInfo.description;
  const specCount = Object.keys(productInfo.specs).length;
  const featureCount = productInfo.features.length;
  const richDescriptionCount = productInfo.rich_product_description.length;
  const keyTechSpecCount = Object.keys(productInfo.keyTechSpecs || {}).length;
  
  logger.debug(`Prepared data for "${product.name}"`, {
    brand: productInfo.brand,
    specCount,
    hasDescription,
    featureCount,
    richDescriptionCount,
    keyTechSpecCount,
    keySpecs: Object.keys(productInfo.keyTechSpecs || {}),
    descriptionExcerpt: hasDescription ? productInfo.description.substring(0, 100) + '...' : 'N/A'
  });
  
  // Log any data quality concerns
  if (!hasDescription) {
    logger.warn(`No description available for "${product.name}"`);
  }
  
  if (featureCount === 0) {
    logger.warn(`No feature bullets available for "${product.name}"`);
  }
  
  if (specCount === 0) {
    logger.warn(`No specifications available for "${product.name}"`);
  }
  
  // Log key technical specs that were found
  if (keyTechSpecCount > 0) {
    logger.info(`Found ${keyTechSpecCount} key technical specs for "${product.name}":`, productInfo.keyTechSpecs);
  } else {
    logger.warn(`No key technical specs could be extracted for "${product.name}"`);
  }
};
