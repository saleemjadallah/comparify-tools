
/**
 * Formats product data in a structured way for Claude's prompt
 */
export function formatProductsForPrompt(products: any[]): string {
  return products.map((product: any) => {
    const { name, brand, price } = product;
    
    // Get description from the right place
    let description = 'No description available';
    if (product.description && typeof product.description === 'string') {
      description = product.description;
    } else if (product.rawData?.description && typeof product.rawData.description === 'string') {
      description = product.rawData.description;
    }
    
    // Get feature bullets from the right place
    let features = 'No features available';
    if (product.rawData?.feature_bullets_flat && Array.isArray(product.rawData.feature_bullets_flat) && product.rawData.feature_bullets_flat.length > 0) {
      features = product.rawData.feature_bullets_flat.join('\n  ');
    } else if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      features = product.features.join('\n  ');
    } else if (product.rich_product_description && Array.isArray(product.rich_product_description) && product.rich_product_description.length > 0) {
      features = product.rich_product_description.join('\n  ');
    }
    
    // Check if the features is still the default value
    if (features === 'No features available') {
      // Try to extract features from specifications if available
      if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
        const extractedFeatures = [];
        
        for (const specGroup of product.rawData.specifications) {
          if (specGroup.name && specGroup.name.toLowerCase().includes('feature')) {
            if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
              for (const spec of specGroup.specifications) {
                if (spec.name && spec.value) {
                  extractedFeatures.push(`${spec.name}: ${spec.value}`);
                }
              }
            }
          }
        }
        
        if (extractedFeatures.length > 0) {
          features = extractedFeatures.join('\n  ');
        }
      }
    }
    
    // Get specifications from the right place
    let specs = 'No specifications available';
    if (product.rawData?.specifications_flat && typeof product.rawData.specifications_flat === 'object') {
      specs = Object.entries(product.rawData.specifications_flat)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n  ');
    } else if (product.specs && typeof product.specs === 'object') {
      specs = Object.entries(product.specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n  ');
    } else if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
      const formattedSpecs = [];
      
      for (const specGroup of product.rawData.specifications) {
        if (specGroup.name) {
          formattedSpecs.push(`${specGroup.name}:`);
          
          if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
            for (const spec of specGroup.specifications) {
              if (spec.name && spec.value) {
                formattedSpecs.push(`  ${spec.name}: ${spec.value}`);
              }
            }
          }
        }
      }
      
      if (formattedSpecs.length > 0) {
        specs = formattedSpecs.join('\n  ');
      }
    }
    
    return `Product: ${name}
Brand: ${brand || 'Unknown'}
Price: $${price || 'Unknown'}
Description:
${description}

Key Features:
  ${features}

Specifications:
  ${specs}`;
  }).join('\n\n' + '-'.repeat(80) + '\n\n');
}
