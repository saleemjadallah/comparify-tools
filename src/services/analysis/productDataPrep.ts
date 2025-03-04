
import { logger } from "./logging";

/**
 * Prepares product data for analysis, ensuring required fields are present
 */
export const prepareProductData = (products: any[]): any[] => {
  logger.info(`Preparing ${products.length} products for analysis`);
  
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
  const hasDescription = !!productInfo.description;
  const specCount = Object.keys(productInfo.specs).length;
  const featureCount = productInfo.features.length;
  
  logger.debug(`Prepared data for "${product.name}"`, {
    brand: productInfo.brand,
    specCount,
    hasDescription,
    featureCount,
    descriptionExcerpt: hasDescription ? productInfo.description.substring(0, 100) + '...' : 'N/A'
  });
  
  // Log any data quality concerns
  if (!hasDescription) {
    logger.warn(`No description available for "${product.name}"`);
  }
  
  if (featureCount === 0) {
    logger.warn(`No feature bullets available for "${product.name}"`);
  }
  
  if (specCount === 0) {
    logger.warn(`No specifications available for "${product.name}"`);
  }
};
