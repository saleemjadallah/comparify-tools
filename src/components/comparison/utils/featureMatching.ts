
/**
 * Find the feature rating for a specific feature in a product's data
 */
export const findFeatureRating = (product: any, featureName: string) => {
  console.log(`Finding feature "${featureName}" in product:`, product.name);
  
  // Check direct feature ratings if available
  if (product.specs?.featureRatings && product.specs.featureRatings[featureName]) {
    console.log(`Found direct feature rating for "${featureName}" in product specs.featureRatings`);
    return product.specs.featureRatings[featureName];
  }
  
  // Check AI analysis data if available
  if (product.aiAnalysis?.featureRatings && product.aiAnalysis.featureRatings[featureName]) {
    console.log(`Found feature rating for "${featureName}" in product aiAnalysis.featureRatings`);
    return product.aiAnalysis.featureRatings[featureName];
  }
  
  // Support legacy/different casing in feature names
  const normalizedFeatureName = featureName.toLowerCase().trim();
  
  // Try to find the feature in featureRatings with case-insensitive matching
  if (product.specs?.featureRatings) {
    for (const [key, value] of Object.entries(product.specs.featureRatings)) {
      if (key.toLowerCase().trim() === normalizedFeatureName) {
        console.log(`Found feature rating for "${featureName}" through case-insensitive matching as "${key}"`);
        return value;
      }
    }
  }
  
  // Also check if the product has rich product description that matches the feature
  if (product.rich_product_description && Array.isArray(product.rich_product_description)) {
    const matchingDescriptions = product.rich_product_description.filter(
      (desc: string) => desc.toLowerCase().includes(normalizedFeatureName)
    );
    
    if (matchingDescriptions.length > 0) {
      console.log(`Found rich product description mentioning "${featureName}"`);
      return {
        rating: 6,
        explanation: matchingDescriptions[0],
        confidence: "low"
      };
    }
  }
  
  // Check if the feature appears in product specs
  if (product.specs) {
    for (const [key, value] of Object.entries(product.specs)) {
      if (key.toLowerCase().includes(normalizedFeatureName) || 
          (typeof value === 'string' && value.toLowerCase().includes(normalizedFeatureName))) {
        console.log(`Found spec mentioning "${featureName}" in key "${key}"`);
        return {
          rating: 7,
          explanation: `${key}: ${value}`,
          confidence: "medium"
        };
      }
    }
  }
  
  // Finally, check if the feature appears in raw product features
  if (product.features && Array.isArray(product.features)) {
    const matchingFeatures = product.features.filter(
      (feature: string) => feature.toLowerCase().includes(normalizedFeatureName)
    );
    
    if (matchingFeatures.length > 0) {
      console.log(`Found feature mentioning "${featureName}" in product features list`);
      return {
        rating: 7,
        explanation: matchingFeatures[0],
        confidence: "medium"
      };
    }
  }
  
  console.log(`No feature rating found for "${featureName}" in product ${product.name}`);
  return null;
};
