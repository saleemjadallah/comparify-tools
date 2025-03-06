
import { EnhancedSpecs } from './types';

/**
 * Flatten enhanced specs categories for simple display
 */
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

/**
 * Get the top N most important specs for a product based on category
 */
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
