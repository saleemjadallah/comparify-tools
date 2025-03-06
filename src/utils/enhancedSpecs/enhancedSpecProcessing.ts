
import { EnhancedSpecs } from './types';
import { determineCategory } from './categoryDetection';
import { 
  processSmartphoneSpecifics, 
  processLaptopSpecifics,
  processTVSpecifics
} from './categorySpecificProcessing';
import { processSpecification } from './specificationProcessor';
import { categoryMappings } from './categoryMappings';

// Simple logger replacement
const logger = {
  debug: (message: string) => console.debug(message),
  info: (message: string) => console.info(message),
  warn: (message: string) => console.warn(message),
  error: (message: string) => console.error(message)
};

/**
 * Enhanced specification processing system
 * Categorizes and normalizes product specifications for better comparisons
 */
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
    enhancedSpecs.physical['Weight'] = `${product.weight.value} ${product.weight.unit}`;
  }
  
  // Process specifications from the specifications array
  if (product.specifications && Array.isArray(product.specifications)) {
    product.specifications.forEach((specGroup: any) => {
      if (specGroup.name && specGroup.value) {
        processSpecification(specGroup.name, specGroup.value, enhancedSpecs, categoryMappings);
      } else if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
        specGroup.specifications.forEach((spec: any) => {
          if (spec.name && spec.value) {
            processSpecification(spec.name, spec.value, enhancedSpecs, categoryMappings);
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
        processSpecification(key, value, enhancedSpecs, categoryMappings);
      } else if (feature.trim()) {
        enhancedSpecs.features[`Feature ${index + 1}`] = feature.trim();
      }
    });
  }
  
  // Process summarization attributes
  if (product.summarization_attributes && Array.isArray(product.summarization_attributes)) {
    product.summarization_attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        processSpecification(attr.name, attr.value, enhancedSpecs, categoryMappings);
      }
    });
  }
  
  // Add category-specific processing based on product type
  const normalizedCategory = determineCategory(categoryName);
  switch(normalizedCategory) {
    case 'smartphones':
      processSmartphoneSpecifics(product, enhancedSpecs);
      break;
    case 'laptops':
      processLaptopSpecifics(product, enhancedSpecs);
      break;
    case 'tvs':
      processTVSpecifics(product, enhancedSpecs);
      break;
    // Add more categories as needed
  }
  
  // Clean up empty categories
  for (const category in enhancedSpecs) {
    if (Object.keys(enhancedSpecs[category as keyof typeof enhancedSpecs]).length === 0) {
      delete enhancedSpecs[category as keyof typeof enhancedSpecs];
    }
  }
  
  logger.debug(`Enhanced specs processed with ${Object.keys(enhancedSpecs).length} categories`);
  
  return enhancedSpecs;
}

// Re-export helper functions from other modules
export { flattenEnhancedSpecs, getTopSpecs } from './specUtils';
