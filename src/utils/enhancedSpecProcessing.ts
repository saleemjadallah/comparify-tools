
/**
 * Enhanced specification processing system
 * Categorizes and normalizes product specifications for better comparisons
 */

// Type for the enhanced specs structure
export interface EnhancedSpecs {
  [category: string]: {
    [name: string]: string;
  };
}

export function enhancedSpecProcessing(product: any, categoryName: string): EnhancedSpecs {
  // Base specs object with categorized specifications
  const enhancedSpecs: EnhancedSpecs = {
    general: {},
    technical: {},
    physical: {},
    performance: {},
    features: {},
    connectivity: {},
    display: {},
    camera: {},
    audio: {},
    battery: {},
    storage: {},
    warranty: {},
    packaging: {},
    compatibility: {},
    other: {}
  };
  
  // Map of known specification categories
  const categoryMappings: Record<string, string> = {
    // Display related
    'display': 'display',
    'screen': 'display',
    'resolution': 'display',
    'refresh rate': 'display',
    
    // Battery related
    'battery': 'battery',
    'charging': 'battery',
    'runtime': 'battery',
    
    // Physical attributes
    'dimensions': 'physical',
    'weight': 'physical',
    'material': 'physical',
    'color': 'physical',
    
    // Performance
    'processor': 'performance',
    'cpu': 'performance',
    'gpu': 'performance',
    'ram': 'performance',
    'memory': 'performance',
    'benchmark': 'performance',
    
    // Storage
    'storage': 'storage',
    'hard drive': 'storage',
    'ssd': 'storage',
    'capacity': 'storage',
    
    // Camera
    'camera': 'camera',
    'lens': 'camera',
    'megapixel': 'camera',
    'photo': 'camera',
    'video': 'camera',
    
    // Connectivity
    'wifi': 'connectivity',
    'bluetooth': 'connectivity',
    'usb': 'connectivity',
    'port': 'connectivity',
    'connection': 'connectivity',
    
    // Audio
    'audio': 'audio',
    'sound': 'audio',
    'speaker': 'audio',
    'microphone': 'audio',
    
    // General
    'model': 'general',
    'brand': 'general',
    'type': 'general',
    'year': 'general',
    
    // Warranty
    'warranty': 'warranty',
    'guarantee': 'warranty',
    'support': 'warranty'
  };
  
  // Category-specific normalization functions
  const normalizers = {
    // Normalize storage values to GB
    normalizeStorage: (value: string): string => {
      const val = value.toLowerCase();
      if (val.includes('tb')) {
        return parseFloat(val) * 1024 + ' GB';
      } else if (val.includes('mb')) {
        return (parseFloat(val) / 1024).toFixed(2) + ' GB';
      } else if (val.includes('kb')) {
        return (parseFloat(val) / (1024 * 1024)).toFixed(4) + ' GB';
      }
      return value;
    },
    
    // Normalize display resolution
    normalizeResolution: (value: string): string => {
      // Convert common marketing terms to actual resolutions
      const resolutionMap: Record<string, string> = {
        'hd': '1280 x 720',
        'full hd': '1920 x 1080',
        'fhd': '1920 x 1080',
        '2k': '2560 x 1440',
        'qhd': '2560 x 1440',
        '4k': '3840 x 2160',
        'uhd': '3840 x 2160',
        '8k': '7680 x 4320'
      };
      
      const lowerValue = value.toLowerCase();
      for (const [term, resolution] of Object.entries(resolutionMap)) {
        if (lowerValue.includes(term)) {
          return `${value} (${resolution})`;
        }
      }
      return value;
    },
    
    // Normalize weight to grams or kilograms
    normalizeWeight: (value: string): string => {
      const val = value.toLowerCase();
      if (val.includes('pound') || val.includes('lb')) {
        const pounds = parseFloat(val);
        return `${pounds} lb (${(pounds * 453.592).toFixed(0)} g)`;
      } else if (val.includes('oz') || val.includes('ounce')) {
        const ounces = parseFloat(val);
        return `${ounces} oz (${(ounces * 28.35).toFixed(0)} g)`;
      }
      return value;
    },
    
    // Normalize RAM to GB
    normalizeRAM: (value: string): string => {
      const val = value.toLowerCase();
      if (val.includes('mb')) {
        return (parseFloat(val) / 1024).toFixed(2) + ' GB';
      } else if (!val.includes('gb') && !isNaN(parseFloat(val))) {
        return parseFloat(val) + ' GB';
      }
      return value;
    }
  };
  
  // Process basic product information
  enhancedSpecs.general['Product Name'] = product.title || 'Unknown';
  enhancedSpecs.general['Brand'] = product.brand || 'Unknown';
  enhancedSpecs.general['Model'] = product.model || '';
  enhancedSpecs.general['ASIN'] = product.asin || '';
  
  // Process pricing information
  if (product.buybox_winner?.price) {
    enhancedSpecs.general['Current Price'] = `${product.buybox_winner.price.value} ${product.buybox_winner.price.currency}`;
  }
  
  // Process rating information
  if (product.rating) {
    enhancedSpecs.general['Rating'] = `${product.rating}/5 (${product.ratings_total || 0} reviews)`;
  }
  
  // Process dimensions if available
  if (product.dimensions) {
    const dimensionString = Object.entries(product.dimensions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    enhancedSpecs.physical['Dimensions'] = dimensionString;
  }
  
  // Process weight if available
  if (product.weight) {
    enhancedSpecs.physical['Weight'] = normalizers.normalizeWeight(`${product.weight.value} ${product.weight.unit}`);
  }
  
  // Helper function to process and categorize a specification
  function processSpecification(name: string, value: any): void {
    // Clean up the name and value
    const cleanName = name.trim();
    const cleanValue = value.toString().trim();
    
    // Skip empty values
    if (!cleanValue) return;
    
    // Determine the category for this specification
    let category = 'other';
    const lowerName = cleanName.toLowerCase();
    
    for (const [keyword, cat] of Object.entries(categoryMappings)) {
      if (lowerName.includes(keyword)) {
        category = cat;
        break;
      }
    }
    
    // Apply category-specific normalization if available
    let normalizedValue = cleanValue;
    
    // Storage normalization
    if (category === 'storage' || lowerName.includes('storage') || 
        lowerName.includes('memory') || lowerName.includes('ram') ||
        lowerName.includes('disk') || lowerName.includes('drive')) {
      normalizedValue = normalizers.normalizeStorage(cleanValue);
    }
    
    // Display resolution normalization
    if (category === 'display' && (lowerName.includes('resolution') || lowerName.includes('display'))) {
      normalizedValue = normalizers.normalizeResolution(cleanValue);
    }
    
    // Weight normalization
    if (lowerName.includes('weight') || category === 'physical') {
      normalizedValue = normalizers.normalizeWeight(cleanValue);
    }
    
    // RAM normalization
    if (lowerName.includes('ram') || lowerName.includes('memory')) {
      normalizedValue = normalizers.normalizeRAM(cleanValue);
    }
    
    // Add to the appropriate category
    enhancedSpecs[category][cleanName] = normalizedValue;
  }
  
  // Process specifications from the specifications array
  if (product.specifications && Array.isArray(product.specifications)) {
    product.specifications.forEach((specGroup: any) => {
      if (specGroup.name && specGroup.value) {
        processSpecification(specGroup.name, specGroup.value);
      } else if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
        specGroup.specifications.forEach((spec: any) => {
          if (spec.name && spec.value) {
            processSpecification(spec.name, spec.value);
          }
        });
      }
    });
  }
  
  // Process features list for additional specifications
  if (product.features && Array.isArray(product.features)) {
    product.features.forEach((feature: string, index: number) => {
      const featureParts = feature.split(':');
      if (featureParts.length >= 2) {
        const key = featureParts[0].trim();
        const value = featureParts.slice(1).join(':').trim();
        processSpecification(key, value);
      } else if (feature.trim()) {
        enhancedSpecs.features[`Feature ${index + 1}`] = feature.trim();
      }
    });
  }
  
  // Process summarization attributes
  if (product.summarization_attributes && Array.isArray(product.summarization_attributes)) {
    product.summarization_attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        processSpecification(attr.name, attr.value);
      }
    });
  }
  
  // Add category-specific processing based on product type
  switch(categoryName.toLowerCase()) {
    case 'smartphones':
    case 'phones':
    case 'mobile phones':
    case 'cell phones':
      processSmartphoneSpecifics(product, enhancedSpecs);
      break;
    case 'laptops':
    case 'notebooks':
    case 'computers':
      processLaptopSpecifics(product, enhancedSpecs);
      break;
    case 'tvs':
    case 'television':
    case 'televisions':
      processTVSpecifics(product, enhancedSpecs);
      break;
    // Add more categories as needed
  }
  
  // Clean up empty categories
  for (const category in enhancedSpecs) {
    if (Object.keys(enhancedSpecs[category]).length === 0) {
      delete enhancedSpecs[category as keyof typeof enhancedSpecs];
    }
  }
  
  return enhancedSpecs;
}

// Category-specific processing functions
function processSmartphoneSpecifics(product: any, specs: EnhancedSpecs): void {
  // Extract camera information
  const description = product.description || '';
  
  // Look for MP camera information in description
  const mpRegex = /(\d+(?:\.\d+)?)\s*MP\s*(?:camera|shooter)/gi;
  const mpMatches = [...description.matchAll(mpRegex)];
  
  if (mpMatches.length > 0) {
    specs.camera['Main Camera'] = specs.camera['Main Camera'] || mpMatches[0][1] + ' MP';
    if (mpMatches.length > 1) {
      specs.camera['Secondary Camera'] = specs.camera['Secondary Camera'] || mpMatches[1][1] + ' MP';
    }
  }
  
  // Look for battery capacity
  const mAhRegex = /(\d+)\s*mAh/i;
  const mAhMatch = description.match(mAhRegex);
  
  if (mAhMatch) {
    specs.battery['Battery Capacity'] = specs.battery['Battery Capacity'] || mAhMatch[1] + ' mAh';
  }
  
  // Detect 5G capability
  if (description.includes('5G')) {
    specs.connectivity['5G Support'] = 'Yes';
  }
}

function processLaptopSpecifics(product: any, specs: EnhancedSpecs): void {
  const description = product.description || '';
  
  // Look for GPU information
  const gpuRegex = /(nvidia|amd|intel)\s*(geforce|radeon|iris|uhd)?\s*(rtx|gtx|rx)?\s*(\d+)?/i;
  const gpuMatch = description.match(gpuRegex);
  
  if (gpuMatch) {
    specs.performance['Graphics'] = specs.performance['Graphics'] || gpuMatch[0];
  }
  
  // Check for SSD vs HDD
  if (description.toLowerCase().includes('ssd')) {
    specs.storage['Storage Type'] = specs.storage['Storage Type'] || 'SSD';
  } else if (description.toLowerCase().includes('hdd') || description.toLowerCase().includes('hard drive')) {
    specs.storage['Storage Type'] = specs.storage['Storage Type'] || 'HDD';
  }
  
  // Check for touchscreen
  if (description.toLowerCase().includes('touch screen') || description.toLowerCase().includes('touchscreen')) {
    specs.display['Touchscreen'] = 'Yes';
  }
}

function processTVSpecifics(product: any, specs: EnhancedSpecs): void {
  const description = product.description || '';
  
  // Check for HDR support
  if (description.match(/\bHDR\d*\b/i)) {
    specs.display['HDR Support'] = 'Yes';
  }
  
  // Check for smart TV capabilities
  if (description.toLowerCase().includes('smart tv')) {
    specs.features['Smart TV'] = 'Yes';
  }
  
  // Detect refresh rate
  const refreshRateRegex = /(\d+)Hz/i;
  const refreshMatch = description.match(refreshRateRegex);
  
  if (refreshMatch) {
    specs.display['Refresh Rate'] = specs.display['Refresh Rate'] || refreshMatch[1] + ' Hz';
  }
}

// Utility function to flatten categories for simple display
export function flattenEnhancedSpecs(enhancedSpecs: EnhancedSpecs): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const category in enhancedSpecs) {
    for (const key in enhancedSpecs[category]) {
      // Prefix the key with the category for better organization
      const prefixedKey = `${category.charAt(0).toUpperCase() + category.slice(1)}: ${key}`;
      result[prefixedKey] = enhancedSpecs[category][key];
    }
  }
  
  return result;
}

// Get the top N most important specs for a product based on category
export function getTopSpecs(enhancedSpecs: EnhancedSpecs, category: string, count: number = 6): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Define priority specs for different categories
  const categoryPriorities: Record<string, string[]> = {
    'smartphones': ['display', 'performance', 'camera', 'battery', 'storage', 'connectivity'],
    'laptops': ['performance', 'display', 'storage', 'physical', 'battery', 'connectivity'],
    'tvs': ['display', 'features', 'connectivity', 'physical', 'audio', 'technical'],
    // Default priorities for any category
    'default': ['performance', 'general', 'technical', 'physical', 'features', 'connectivity']
  };
  
  // Get the appropriate priority list
  const priorities = categoryPriorities[category.toLowerCase()] || categoryPriorities.default;
  
  // Collect specs based on priorities
  let specCount = 0;
  
  // First pass: collect specs based on priority categories
  for (const priorityCategory of priorities) {
    if (enhancedSpecs[priorityCategory]) {
      for (const key in enhancedSpecs[priorityCategory]) {
        if (specCount < count) {
          result[key] = enhancedSpecs[priorityCategory][key];
          specCount++;
        } else {
          break;
        }
      }
    }
    
    if (specCount >= count) break;
  }
  
  // If we still need more specs, add from any remaining categories
  if (specCount < count) {
    for (const specCategory in enhancedSpecs) {
      // Skip categories we've already processed
      if (priorities.includes(specCategory)) continue;
      
      for (const key in enhancedSpecs[specCategory]) {
        if (specCount < count) {
          result[key] = enhancedSpecs[specCategory][key];
          specCount++;
        } else {
          break;
        }
      }
      
      if (specCount >= count) break;
    }
  }
  
  return result;
}
