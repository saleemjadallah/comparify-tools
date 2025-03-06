
// Export main functionality
export { enhancedSpecProcessing, flattenEnhancedSpecs, getTopSpecs } from './enhancedSpecProcessing';

// Export types
export { EnhancedSpecs } from './types';

// Export utility functions
export { processSpecification } from './specificationProcessor';
export { normalizers } from './normalizers';
export { determineCategory } from './categoryDetection';
export { 
  processSmartphoneSpecifics, 
  processLaptopSpecifics,
  processTVSpecifics
} from './categorySpecificProcessing';
