
import { EnhancedSpecs, CategoryMapping } from './types';
import { normalizers } from './normalizers';

/**
 * Process and categorize a specification
 */
export function processSpecification(
  name: string, 
  value: any, 
  enhancedSpecs: EnhancedSpecs, 
  categoryMappings: CategoryMapping
): void {
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
