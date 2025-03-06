
// Helper function to extract rich product description from Rainforest data
export function extractRichProductDescription(product: any): string[] {
  const richDescriptions: string[] = []
  
  // Extract from features list
  if (product.features && Array.isArray(product.features)) {
    richDescriptions.push(...product.features.filter(f => typeof f === 'string' && f.trim().length > 0))
  }
  
  // Extract from full_description if it exists
  if (product.description && typeof product.description === 'string') {
    // Split by paragraphs or bullet points and clean
    const parts = product.description
      .split(/\n+|•|\*|\\n|<br>|<br\/>|<p>|<\/p>/)
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 0)
    
    richDescriptions.push(...parts)
  }
  
  // Extract from product details section if available
  if (product.product_details && Array.isArray(product.product_details)) {
    product.product_details.forEach((detail: any) => {
      if (detail.name && detail.value && typeof detail.value === 'string') {
        richDescriptions.push(`${detail.name}: ${detail.value}`)
      }
    })
  }
  
  // Extract from product information section if available
  if (product.product_information && typeof product.product_information === 'object') {
    Object.entries(product.product_information).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        richDescriptions.push(`${key}: ${value}`)
      }
    })
  }
  
  // Extract from feature_bullets if available
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    richDescriptions.push(...product.feature_bullets.filter(f => typeof f === 'string' && f.trim().length > 0))
  }
  
  // Extract from editorial_reviews if available
  if (product.editorial_reviews && Array.isArray(product.editorial_reviews)) {
    product.editorial_reviews.forEach((review: any) => {
      if (review.title && typeof review.title === 'string') {
        richDescriptions.push(`${review.title}`)
      }
      if (review.content && typeof review.content === 'string') {
        // Split by paragraphs and clean
        const reviewParts = review.content
          .split(/\n+|•|\*|\\n|<br>|<br\/>|<p>|<\/p>/)
          .map((part: string) => part.trim())
          .filter((part: string) => part.length > 0)
        
        richDescriptions.push(...reviewParts)
      }
    })
  }
  
  // Deduplicate descriptions
  const uniqueDescriptions = [...new Set(richDescriptions)]
  
  console.log(`Extracted ${uniqueDescriptions.length} rich description parts (${richDescriptions.length} before deduplication)`)
  
  return uniqueDescriptions
}

// Extract top reviews from product data
export function extractTopReviews(product: any): any[] {
  if (product.top_reviews && Array.isArray(product.top_reviews)) {
    return product.top_reviews.map((review: any) => ({
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      date: review.date,
      verified_purchase: review.verified_purchase
    }))
  }
  
  return []
}

// Helper function to transform Rainforest product specs
export function transformRainforestSpecs(product: any): Record<string, string> {
  const specs: Record<string, string> = {}
  
  // Recursively extract all nested specifications
  function extractSpecsRecursively(obj: any, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      // Skip arrays of objects, we'll handle those separately
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') return;
      
      // Skip null values
      if (value === null) return;
      
      // Handle primitive values or arrays of primitives
      if (typeof value !== 'object' || 
         (Array.isArray(value) && value.every(v => typeof v !== 'object' || v === null))) {
        const specKey = prefix ? `${prefix} ${key}` : key;
        specs[specKey] = Array.isArray(value) ? value.join(', ') : String(value);
      } 
      // Recurse into nested objects
      else if (typeof value === 'object' && !Array.isArray(value)) {
        extractSpecsRecursively(value, prefix ? `${prefix} ${key}` : key);
      }
    });
  }
  
  // Add basic specifications
  if (product.buybox_winner?.price?.currency) specs['Currency'] = product.buybox_winner.price.currency
  if (product.rating) specs['Rating'] = product.rating.toString()
  if (product.ratings_total) specs['Total Reviews'] = product.ratings_total.toString()
  if (product.buybox_winner?.fulfillment?.is_prime) specs['Prime'] = 'Yes'
  if (product.buybox_winner?.shipping?.is_free) specs['Free Shipping'] = 'Yes'
  
  // Add dimensions if available
  if (product.dimensions) {
    for (const [key, value] of Object.entries(product.dimensions)) {
      specs[`Dimension (${key})`] = value.toString()
    }
  }
  
  // Add weight if available
  if (product.weight) {
    specs['Weight'] = `${product.weight.value} ${product.weight.unit}`
  }
  
  // Add categorization
  if (product.categories && product.categories.length > 0) {
    specs['Category Path'] = product.categories.join(' > ')
  }
  
  // Add summarization attributes if available
  if (product.summarization_attributes && Array.isArray(product.summarization_attributes)) {
    product.summarization_attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        specs[attr.name] = attr.value
      }
    })
  }
  
  // Extract technical details from attributes
  if (product.attributes && Array.isArray(product.attributes)) {
    product.attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        specs[attr.name] = attr.value;
      }
    });
  }
  
  // Add specifications from the specifications array with improved handling
  if (product.specifications && Array.isArray(product.specifications)) {
    product.specifications.forEach((specGroup: any) => {
      const groupPrefix = specGroup.name ? `${specGroup.name}` : '';
      
      if (specGroup.name && specGroup.value) {
        specs[specGroup.name] = specGroup.value;
      } else if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
        specGroup.specifications.forEach((spec: any) => {
          if (spec.name && spec.value) {
            const specKey = groupPrefix ? `${groupPrefix} - ${spec.name}` : spec.name;
            specs[specKey] = spec.value;
          }
        });
      }
    });
  }
  
  // Extract from feature bullets that might contain specs
  if (product.features && Array.isArray(product.features)) {
    // Look for features that contain technical specifications
    product.features.forEach((feature: string, index: number) => {
      if (typeof feature !== 'string') return;
      
      // Extract specs from features that follow patterns like "X: Y" or "X - Y"
      const specMatch = feature.match(/([^:]+):\s*(.+)/) || feature.match(/([^-]+)\s+-\s+(.+)/);
      if (specMatch) {
        const [_, name, value] = specMatch;
        const featureKey = `Feature Spec ${name.trim()}`;
        specs[featureKey] = value.trim();
      }
    });
  }
  
  // Try to extract data from the entire product object for important specs
  // This helps catch specs that might be in unexpected locations
  extractSpecsRecursively(product);
  
  // Log specifications structure for debugging
  console.log(`Extracted ${Object.keys(specs).length} specs for product`);
  
  return specs
}

// Transform Rainforest API product data into our application format
export function transformResults(productDetails: any[], categoryName: string): any[] {
  return productDetails.map((data: any) => {
    // Extract product key data
    const product = data.product;
    
    // Perform a deeper extraction of features
    let features = product.features || [];
    
    // Extract feature bullets if available but not already in features
    if (product.feature_bullets && Array.isArray(product.feature_bullets) && 
        (features.length === 0 || product.feature_bullets.length > features.length)) {
      features = product.feature_bullets;
    }
    
    // Look for feature_bullets_flat which is sometimes more complete
    if (product.feature_bullets_flat && Array.isArray(product.feature_bullets_flat) && 
        (features.length === 0 || product.feature_bullets_flat.length > features.length)) {
      features = product.feature_bullets_flat;
    }
    
    // Process and extract specifications
    const specs = transformRainforestSpecs(product);
    
    // Get rich product description
    const richDescription = extractRichProductDescription(product);
    
    // Ensure complete description by combining multiple sources if needed
    let fullDescription = product.description || '';
    if (fullDescription.length < 100 && product.feature_description) {
      fullDescription = product.feature_description + '\n\n' + fullDescription;
    }
    
    // Extract technical details if they exist
    const technicalDetails = product.technical_details || product.technical_specification || {};
    
    // Prepare list of specifications as an array for better structure
    const specifications = product.specifications || [];
    
    // Include product dimensions in a structured way
    const dimensions = product.dimensions || {};
    
    // Include additional fields that might contain valuable product data
    const transformedResult = {
      id: product.asin || `rainforest-${crypto.randomUUID()}`,
      name: product.title || 'Unknown Product',
      brand: product.brand || '',
      price: product.buybox_winner?.price?.value || 0,
      currency: product.buybox_winner?.price?.currency || 'USD',
      category: categoryName,
      rating: product.rating,
      total_reviews: product.ratings_total,
      specs: specs, // Enhanced specs from our transformer
      
      // Add structured specifications data
      specifications_flat: specs,
      specifications: specifications,
      technical_details: technicalDetails,
      dimensions: dimensions,
      
      // Images
      imageUrl: product.main_image?.link || '',
      images: (product.images || []).map((img: any) => img.link),
      
      // Source tracking
      source: 'rainforest',
      source_id: product.asin || '',
      
      // Enhanced description fields
      description: fullDescription,
      rich_product_description: richDescription,
      features: features,
      
      // Review and related product data
      top_reviews: extractTopReviews(product),
      pricing_context: product.pricing_context || {},
      similar_products: (product.similar_products || []).slice(0, 5),
      variants: product.variants || [],
      
      // Add metadata about data quality
      meta: {
        has_description: fullDescription.length > 0,
        description_length: fullDescription.length,
        has_features: features.length > 0,
        features_count: features.length,
        has_specs: Object.keys(specs).length > 0,
        specs_count: Object.keys(specs).length,
        has_reviews: (product.top_reviews || []).length > 0,
        reviews_count: (product.top_reviews || []).length,
        data_quality_score: calculateDataQualityScore(product, specs, features, richDescription)
      }
    };
    
    // Enhanced logging for each product's extracted data
    console.log(`Transformed product ${transformedResult.id}: ${transformedResult.name} (${transformedResult.brand})`);
    console.log(`  - Specifications count: ${Object.keys(transformedResult.specs).length}`);
    console.log(`  - Features count: ${transformedResult.features.length}`);
    console.log(`  - Rich description paragraphs: ${transformedResult.rich_product_description.length}`);
    console.log(`  - Reviews count: ${transformedResult.top_reviews.length}`);
    console.log(`  - Data quality score: ${transformedResult.meta.data_quality_score}/10`);
    
    return transformedResult;
  });
}

// Helper function to calculate data quality score
function calculateDataQualityScore(product: any, specs: any, features: string[], richDescription: string[]): number {
  let score = 0;
  
  // Score based on description quality
  if (product.description && product.description.length > 500) score += 2;
  else if (product.description && product.description.length > 200) score += 1;
  
  // Score based on feature count
  if (features.length > 8) score += 3;
  else if (features.length > 4) score += 2;
  else if (features.length > 0) score += 1;
  
  // Score based on specification count
  if (Object.keys(specs).length > 20) score += 3;
  else if (Object.keys(specs).length > 10) score += 2;
  else if (Object.keys(specs).length > 0) score += 1;
  
  // Score based on rich description
  if (richDescription.length > 10) score += 2;
  else if (richDescription.length > 5) score += 1;
  
  return score;
}
