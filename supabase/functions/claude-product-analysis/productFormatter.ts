/**
 * Enhanced product formatter that extracts comprehensive data from multiple sources
 * and formats it in a structured way for Claude AI analysis.
 */
export function formatProductsForPrompt(products: any[]): string {
  return products.map((product: any, index: number) => {
    // Extract basic product info with more fallbacks
    const name = product.name || product.title || product.rawData?.title || 'Unknown Product';
    const brand = product.brand || product.manufacturer || product.rawData?.brand || 'Unknown brand';
    const price = product.price || product.rawData?.price || product.rawData?.current_price || 'Unknown';
    const id = product.id || product.asin || product.rawData?.asin || `product-${index + 1}`;
    
    // Simple header with product number and ID for easier reference
    const header = `PRODUCT #${index + 1}: ${name} (${brand}) [ID:${id}]`;
    
    // Get description from any available source
    let description = 'No description available';
    if (product.description && typeof product.description === 'string') {
      description = product.description;
    } else if (product.rawData?.description && typeof product.rawData.description === 'string') {
      description = product.rawData.description;
    } else if (product.summary && typeof product.summary === 'string') {
      description = product.summary;
    } else if (product.rawData?.summary && typeof product.rawData.summary === 'string') {
      description = product.rawData.summary;
    }
    
    // Get features from any available source
    let features = 'No features available';
    
    // Try to find features from various possible sources
    if (product.rawData?.feature_bullets_flat && Array.isArray(product.rawData.feature_bullets_flat) && product.rawData.feature_bullets_flat.length > 0) {
      features = product.rawData.feature_bullets_flat.join('\n  - ');
    } else if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      features = product.features.join('\n  - ');
    } else if (product.rich_product_description && Array.isArray(product.rich_product_description) && product.rich_product_description.length > 0) {
      features = product.rich_product_description.join('\n  - ');
    } else if (product.rawData?.bullet_points && Array.isArray(product.rawData.bullet_points) && product.rawData.bullet_points.length > 0) {
      features = product.rawData.bullet_points.join('\n  - ');
    } else if (product.bullet_points && Array.isArray(product.bullet_points) && product.bullet_points.length > 0) {
      features = product.bullet_points.join('\n  - ');
    }
    
    // Get specifications from multiple sources and combine them
    let specsPoints: string[] = [];
    
    // Check all possible specification sources and add them to the specs array
    if (product.rawData?.specifications_flat && typeof product.rawData.specifications_flat === 'object') {
      specsPoints = [
        ...specsPoints,
        ...Object.entries(product.rawData.specifications_flat)
          .map(([key, value]) => `  - ${key}: ${value}`)
      ];
    }
    
    if (product.specs && typeof product.specs === 'object') {
      specsPoints = [
        ...specsPoints,
        ...Object.entries(product.specs)
          .map(([key, value]) => `  - ${key}: ${value}`)
      ];
    }
    
    // Add structured specifications if available
    if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
      for (const specGroup of product.rawData.specifications) {
        if (specGroup.name) {
          specsPoints.push(`  - ${specGroup.name}:`);
          
          if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
            for (const spec of specGroup.specifications) {
              if (spec.name && spec.value) {
                specsPoints.push(`    - ${spec.name}: ${spec.value}`);
              }
            }
          }
        }
      }
    }
    
    // Check for attribute refinements (common in Rainforest API data)
    if (product.rawData?.attribute_refinements && Array.isArray(product.rawData.attribute_refinements)) {
      for (const attr of product.rawData.attribute_refinements) {
        if (attr.name && attr.values && Array.isArray(attr.values)) {
          specsPoints.push(`  - ${attr.name}: ${attr.values.join(', ')}`);
        }
      }
    }
    
    // Add tech specs if available in a dedicated section
    if (product.keyTechSpecs && typeof product.keyTechSpecs === 'object') {
      Object.entries(product.keyTechSpecs).forEach(([key, value]) => {
        specsPoints.push(`  - ${key}: ${value}`);
      });
    }
    
    // Check for dimensions, weight and other common specs in various locations
    const dimensionsKeys = ['dimensions', 'size', 'product_dimensions', 'item_dimensions'];
    const weightKeys = ['weight', 'item_weight', 'product_weight'];
    
    // Search for dimensions and weight in various places
    for (const key of dimensionsKeys) {
      if (product[key] || product.rawData?.[key]) {
        specsPoints.push(`  - Dimensions: ${product[key] || product.rawData?.[key]}`);
        break;
      }
    }
    
    for (const key of weightKeys) {
      if (product[key] || product.rawData?.[key]) {
        specsPoints.push(`  - Weight: ${product[key] || product.rawData?.[key]}`);
        break;
      }
    }
    
    // Format the specifications
    const specs = specsPoints.length > 0 ? specsPoints.join('\n') : 'No specifications available';
    
    // If there are reviews available, add them
    let reviewsSection = '';
    if (product.top_reviews && Array.isArray(product.top_reviews) && product.top_reviews.length > 0) {
      const reviewsText = product.top_reviews
        .map((review: any) => `  - ${review.title || 'Review'} (Rating: ${review.rating}/5): ${review.body || 'No content'}`)
        .join('\n');
      
      reviewsSection = `\nTOP CUSTOMER REVIEWS:\n${reviewsText}`;
    }
    
    // Add ratings information if available
    let ratingsSection = '';
    if (product.rating || product.rawData?.rating) {
      const rating = product.rating || product.rawData?.rating;
      const ratingCount = product.rating_count || product.rawData?.rating_count || 'unknown number of';
      
      ratingsSection = `\nRATINGS: ${rating}/5 stars from ${ratingCount} ratings`;
    }
    
    // Format the product data in a structured format
    return `${header}
Price: $${price}
${ratingsSection}

DESCRIPTION:
${description}

KEY FEATURES:
  - ${features}

SPECIFICATIONS:
${specs}
${reviewsSection}
`;
  }).join('\n\n' + '-'.repeat(80) + '\n\n');
}