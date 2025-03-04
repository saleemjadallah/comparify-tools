
import { normalizeFeatureName } from './featureUtils';

// Function to find the right feature data from product's feature ratings
export const findFeatureRating = (product: any, feature: string) => {
  // Extract the feature ratings from the right location
  // It could be in product.specs.featureRatings or directly in product.featureRatings
  let featureRatings = {};
  
  if (product.specs && product.specs.featureRatings) {
    featureRatings = product.specs.featureRatings;
    console.log(`Found featureRatings in product.specs.featureRatings for ${product.name}`);
  } else if (product.featureRatings) {
    featureRatings = product.featureRatings;
    console.log(`Found featureRatings directly in product.featureRatings for ${product.name}`);
  }
  
  // Normalize current feature name
  const normalizedFeature = normalizeFeatureName(feature);
  
  // Log the available feature ratings for debugging
  console.log(`Feature ratings for ${product.name}:`, 
    Object.keys(featureRatings).length > 0 
      ? Object.keys(featureRatings).join(', ') 
      : 'None available');
  
  // Try different formats of the feature name to find a match
  let aiRating = null;
  
  // Multiple attempts to match the feature name
  const possibleFeatureKeys = [
    feature,                                    // Exact match
    feature.toLowerCase(),                      // Lowercase
    normalizedFeature,                          // Normalized (alphanumeric only)
    feature.replace(/\s+/g, ''),                // No spaces
    feature.replace(/[^a-zA-Z0-9]/g, '')        // Alphanumeric only
  ];
  
  // Try each possible key format
  for (const key of possibleFeatureKeys) {
    if (featureRatings[key]) {
      aiRating = featureRatings[key];
      console.log(`Found match for "${feature}" using key "${key}" in ${product.name}`);
      break;
    }
  }
  
  // If still no match, try a more fuzzy approach by checking if any key contains the feature
  if (!aiRating) {
    const featureKeys = Object.keys(featureRatings);
    for (const key of featureKeys) {
      const normalizedKey = normalizeFeatureName(key);
      if (normalizedKey.includes(normalizedFeature) || normalizedFeature.includes(normalizedKey)) {
        aiRating = featureRatings[key];
        console.log(`Found fuzzy match for "${feature}" using key "${key}" in ${product.name}`);
        break;
      }
    }
  }
  
  // Last resort: look for any partial string match
  if (!aiRating) {
    const featureKeys = Object.keys(featureRatings);
    for (const key of featureKeys) {
      if (key.toLowerCase().includes(feature.toLowerCase()) || 
          feature.toLowerCase().includes(key.toLowerCase())) {
        aiRating = featureRatings[key];
        console.log(`Found partial string match for "${feature}" using key "${key}" in ${product.name}`);
        break;
      }
    }
  }
  
  return aiRating;
};
