
/**
 * Normalize category names to standard formats
 */
export function determineCategory(categoryName: string): string {
  const lowerCategory = categoryName.toLowerCase();
  
  // Map various category names to standardized categories
  if (lowerCategory.includes('phone') || lowerCategory.includes('smartphone') || lowerCategory.includes('mobile')) {
    return 'smartphones';
  }
  
  if (lowerCategory.includes('laptop') || lowerCategory.includes('notebook') || lowerCategory.includes('computer')) {
    return 'laptops';
  }
  
  if (lowerCategory.includes('tv') || lowerCategory.includes('television')) {
    return 'tvs';
  }
  
  if (lowerCategory.includes('headphone') || lowerCategory.includes('earphone') || lowerCategory.includes('earbud')) {
    return 'headphones';
  }
  
  if (lowerCategory.includes('camera') || lowerCategory.includes('dslr') || lowerCategory.includes('mirrorless')) {
    return 'cameras';
  }
  
  // Return the original category if no mapping is found
  return lowerCategory;
}
