/**
 * This module formats product data into a structured format for Claude to analyze
 * Focuses on extracting all available information from potentially inconsistent sources
 * and organizing it in a way that makes comparison easier
 */

export interface FormattedProductData {
  id: string;
  name: string;
  brand: string;
  price: number | string;
  currency?: string;
  description: string;
  features: string[];
  specifications: Record<string, any>;
  keyTechSpecs?: Record<string, any>;
  reviews?: {
    rating: number;
    reviewCount: number;
    topReviews: {
      rating: number;
      title?: string;
      text: string;
    }[];
  };
  // Additional fields to help with analysis
  category: string;
  images?: string[];
  dimensions?: {
    width?: string | number;
    height?: string | number;
    depth?: string | number;
    weight?: string | number;
    units?: string;
  };
}

/**
 * Extract and normalize product data from potentially inconsistent sources
 */
export function formatProductDataForAnalysis(products: any[]): FormattedProductData[] {
  return products.map((product: any, index: number) => {
    // Extract basic product info with fallbacks
    const id = product.id || product.asin || product.rawData?.asin || `product-${index + 1}`;
    const name = product.name || product.title || product.rawData?.title || 'Unknown Product';
    const brand = product.brand || product.manufacturer || product.rawData?.brand || 'Unknown brand';
    const price = product.price || product.rawData?.price || product.rawData?.current_price || 'Unknown';
    const currency = product.currency || product.rawData?.currency || 'USD';
    
    // Get consolidated description
    let description = 'No description available';
    
    // Try multiple potential sources for description
    if (product.description && typeof product.description === 'string') {
      description = product.description;
    } else if (product.rawData?.description && typeof product.rawData.description === 'string') {
      description = product.rawData.description;
    } else if (product.summary && typeof product.summary === 'string') {
      description = product.summary;
    } else if (product.rawData?.summary && typeof product.rawData.summary === 'string') {
      description = product.rawData.summary;
    }
    
    // Collect features from all available sources
    const features: string[] = [];
    
    // Try all potential feature sources
    if (product.rawData?.feature_bullets_flat && Array.isArray(product.rawData.feature_bullets_flat)) {
      features.push(...product.rawData.feature_bullets_flat);
    }
    
    if (product.features && Array.isArray(product.features)) {
      features.push(...product.features);
    }
    
    if (product.rich_product_description && Array.isArray(product.rich_product_description)) {
      features.push(...product.rich_product_description);
    }
    
    if (product.rawData?.bullet_points && Array.isArray(product.rawData.bullet_points)) {
      features.push(...product.rawData.bullet_points);
    }
    
    if (product.bullet_points && Array.isArray(product.bullet_points)) {
      features.push(...product.bullet_points);
    }
    
    // Collect all specifications into a normalized format
    const specifications: Record<string, any> = {};
    
    // Try multiple potential sources for specifications
    if (product.rawData?.specifications_flat && typeof product.rawData.specifications_flat === 'object') {
      Object.entries(product.rawData.specifications_flat).forEach(([key, value]) => {
        specifications[key] = value;
      });
    }
    
    if (product.specs && typeof product.specs === 'object') {
      Object.entries(product.specs).forEach(([key, value]) => {
        specifications[key] = value;
      });
    }
    
    // Handle structured specifications if available
    if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
      for (const specGroup of product.rawData.specifications) {
        if (specGroup.name && specGroup.specifications && Array.isArray(specGroup.specifications)) {
          // Create a nested object for this specification group
          specifications[specGroup.name] = {};
          
          for (const spec of specGroup.specifications) {
            if (spec.name && spec.value) {
              specifications[specGroup.name][spec.name] = spec.value;
              // Also add as a flat key for easier access
              specifications[`${specGroup.name}.${spec.name}`] = spec.value;
            }
          }
        }
      }
    }
    
    // Include attribute refinements
    if (product.rawData?.attribute_refinements && Array.isArray(product.rawData.attribute_refinements)) {
      for (const attr of product.rawData.attribute_refinements) {
        if (attr.name && attr.values && Array.isArray(attr.values)) {
          specifications[attr.name] = attr.values.join(', ');
        }
      }
    }
    
    // Extract key tech specs
    const keyTechSpecs = product.keyTechSpecs || {};
    
    // Extract review data
    const reviews = product.rating || product.rawData?.rating ? {
      rating: product.rating || product.rawData?.rating || 0,
      reviewCount: product.rating_count || product.rawData?.rating_count || 0,
      topReviews: []
    } : undefined;
    
    // Add top reviews if available
    if (reviews && product.top_reviews && Array.isArray(product.top_reviews)) {
      reviews.topReviews = product.top_reviews.map((review: any) => ({
        rating: review.rating || 0,
        title: review.title || '',
        text: review.body || ''
      }));
    }
    
    // Extract dimensions and weight information
    const dimensions: any = {};
    
    // Check for dimensions in standard places
    if (product.dimensions || product.rawData?.dimensions) {
      const dimensionStr = product.dimensions || product.rawData?.dimensions;
      
      // Try to parse dimensions from string format like "5.2 x 2.3 x 0.4 inches"
      if (typeof dimensionStr === 'string') {
        const match = dimensionStr.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(\w+)/i);
        if (match) {
          dimensions.width = parseFloat(match[1]);
          dimensions.height = parseFloat(match[2]);
          dimensions.depth = parseFloat(match[3]);
          dimensions.units = match[4];
        } else {
          dimensions.raw = dimensionStr;
        }
      } else if (typeof dimensionStr === 'object') {
        Object.assign(dimensions, dimensionStr);
      }
    }
    
    // Check for weight information
    if (product.weight || product.rawData?.weight) {
      const weightStr = product.weight || product.rawData?.weight;
      
      if (typeof weightStr === 'string') {
        const match = weightStr.match(/(\d+\.?\d*)\s*(\w+)/i);
        if (match) {
          dimensions.weight = parseFloat(match[1]);
          dimensions.weightUnits = match[2];
        } else {
          dimensions.rawWeight = weightStr;
        }
      } else if (typeof weightStr === 'number') {
        dimensions.weight = weightStr;
      }
    }
    
    // Additional dimension/weight fields that might be available
    const dimensionFields = [
      'product_dimensions', 'item_dimensions', 'package_dimensions',
      'product_weight', 'item_weight', 'shipping_weight'
    ];
    
    for (const field of dimensionFields) {
      if (product[field] || product.rawData?.[field]) {
        const value = product[field] || product.rawData?.[field];
        dimensions[field] = value;
      }
    }
    
    // Extract image URLs if available
    const images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    } else if (product.rawData?.images && Array.isArray(product.rawData.images)) {
      images.push(...product.rawData.images);
    } else if (product.image || product.rawData?.image) {
      images.push(product.image || product.rawData?.image);
    }
    
    // Construct the final formatted product object
    return {
      id,
      name,
      brand,
      price,
      currency,
      description,
      features: Array.from(new Set(features)), // Remove duplicates
      specifications,
      keyTechSpecs,
      reviews,
      category: product.category || '',
      images: images.length > 0 ? images : undefined,
      dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined
    };
  });
}