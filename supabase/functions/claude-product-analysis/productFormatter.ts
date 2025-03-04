
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
    if (product.rawData?.feature_bullets_flat && Array.isArray(product.rawData.feature_bullets_flat)) {
      features = product.rawData.feature_bullets_flat.join('\n  ');
    } else if (product.features && Array.isArray(product.features)) {
      features = product.features.join('\n  ');
    } else if (product.rich_product_description && Array.isArray(product.rich_product_description)) {
      features = product.rich_product_description.join('\n  ');
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
