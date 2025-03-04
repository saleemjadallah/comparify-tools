
/**
 * Prepares product data for analysis, ensuring required fields are present
 */
export const prepareProductData = (products: any[]): any[] => {
  return products.map(product => {
    // Create a base product object with essential fields
    const productInfo = {
      name: product.name,
      brand: product.brand || 'Unknown',
      price: product.price || 'Unknown',
      specs: product.specs || product.details?.specs || {},
      id: product.id || crypto.randomUUID(),
      
      // These are the three key fields from Rainforest API we want to focus on
      description: product.description || '',
      features: product.features || [],
      rich_product_description: product.rich_product_description || [],
      
      // Include raw data for access to all available fields
      rawData: {
        ...product,
        // Explicitly map the three key Rainforest API fields we want to focus on
        description: product.description || '',
        feature_bullets_flat: product.features || product.rich_product_description || [],
        specifications_flat: product.specs || {}
      }
    };
    
    logProductData(product, productInfo);
    
    return productInfo;
  });
};

/**
 * Logs prepared product data for debugging
 */
const logProductData = (product: any, productInfo: any): void => {
  console.log(`Prepared data for "${product.name}" with the following key information:`);
  console.log(`- Brand: ${productInfo.brand}`);
  console.log(`- Specifications count: ${Object.keys(productInfo.specs).length}`);
  console.log(`- Description available: ${productInfo.description ? 'Yes' : 'No'}`);
  console.log(`- Feature bullets count: ${productInfo.features.length}`);
  
  if (product.description) {
    console.log(`- Description excerpt: ${product.description.substring(0, 100)}...`);
  } else {
    console.warn(`- No description available for "${product.name}"`);
  }
  
  if (productInfo.features.length === 0) {
    console.warn(`- No feature bullets available for "${product.name}"`);
  }
  
  if (Object.keys(productInfo.specs).length === 0) {
    console.warn(`- No specifications available for "${product.name}"`);
  }
};
