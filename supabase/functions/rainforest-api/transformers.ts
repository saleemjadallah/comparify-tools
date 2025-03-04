
// Helper function to extract rich product description from Rainforest data
export function extractRichProductDescription(product: any): string[] {
  const richDescriptions: string[] = []
  
  // Extract from features list
  if (product.features && Array.isArray(product.features)) {
    richDescriptions.push(...product.features)
  }
  
  // Extract from full_description if it exists
  if (product.description && typeof product.description === 'string') {
    // Split by paragraphs or bullet points
    const parts = product.description
      .split(/\n+|•/)
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 0)
    
    richDescriptions.push(...parts)
  }
  
  return richDescriptions
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
  
  // Add specifications from the specifications array
  if (product.specifications && Array.isArray(product.specifications)) {
    product.specifications.forEach((specGroup: any) => {
      if (specGroup.name && specGroup.value) {
        specs[specGroup.name] = specGroup.value
      } else if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
        specGroup.specifications.forEach((spec: any) => {
          if (spec.name && spec.value) {
            specs[spec.name] = spec.value
          }
        })
      }
    })
  }
  
  // Log specifications structure for debugging
  console.log(`Extracted ${Object.keys(specs).length} specs for product`);
  
  return specs
}

// Transform Rainforest API product data into our application format
export function transformResults(productDetails: any[], categoryName: string): any[] {
  return productDetails.map((data: any) => {
    const transformedResult = {
      id: data.product.asin || `rainforest-${crypto.randomUUID()}`,
      name: data.product.title || 'Unknown Product',
      brand: data.product.brand || '',
      price: data.product.buybox_winner?.price?.value || 0,
      currency: data.product.buybox_winner?.price?.currency || 'USD',
      category: categoryName,
      rating: data.product.rating,
      total_reviews: data.product.ratings_total,
      specs: transformRainforestSpecs(data.product),
      imageUrl: data.product.main_image?.link || '',
      images: (data.product.images || []).map((img: any) => img.link),
      source: 'rainforest',
      source_id: data.product.asin || '',
      description: data.product.description || '',
      rich_product_description: extractRichProductDescription(data.product),
      specifications: data.product.specifications || [],
      features: data.product.features || [],
      top_reviews: extractTopReviews(data.product),
      pricing_context: data.product.pricing_context || {},
      similar_products: (data.product.similar_products || []).slice(0, 5),
      variants: data.product.variants || []
    };
    
    // Enhanced logging for each product's extracted data
    console.log(`Transformed product ${transformedResult.id}: ${transformedResult.name} (${transformedResult.brand})`);
    console.log(`  - Specifications count: ${Object.keys(transformedResult.specs).length}`);
    console.log(`  - Features count: ${transformedResult.features.length}`);
    console.log(`  - Rich description paragraphs: ${transformedResult.rich_product_description.length}`);
    console.log(`  - Reviews count: ${transformedResult.top_reviews.length}`);
    
    return transformedResult;
  });
}
