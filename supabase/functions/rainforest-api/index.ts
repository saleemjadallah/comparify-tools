
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS requests for CORS
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request parameters
    const { searchQuery, categoryName, limit = 5 } = await req.json()
    
    if (!searchQuery || !categoryName) {
      throw new Error('Missing required parameters: searchQuery and categoryName')
    }

    // Get Rainforest API key from Supabase secrets
    const rainforestApiKey = Deno.env.get('RAINFOREST_API_KEY')
    
    if (!rainforestApiKey) {
      throw new Error('Rainforest API key is not configured')
    }

    // Prepare Rainforest API search request
    const apiUrl = 'https://api.rainforestapi.com/request'
    const searchParams = new URLSearchParams({
      api_key: rainforestApiKey,
      type: 'search',
      amazon_domain: 'amazon.com',
      search_term: `${searchQuery} ${categoryName}`,
    })

    console.log(`Searching Rainforest API for: ${searchQuery} in category ${categoryName}`)
    console.log(`Search parameters: ${JSON.stringify(Object.fromEntries(searchParams))}`)
    
    // Make the initial search request to Rainforest API
    const searchResponse = await fetch(`${apiUrl}?${searchParams.toString()}`)
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('Rainforest API search error:', errorText)
      throw new Error(`Rainforest API search error: ${searchResponse.status} ${errorText}`)
    }
    
    const searchData = await searchResponse.json()
    console.log(`Search results count: ${searchData.search_results?.length || 0}`)
    
    // Extract ASINs from search results (limit to top N results)
    const asins = searchData.search_results
      .slice(0, limit)
      .map((item: any) => item.asin)
      .filter((asin: string) => asin) // Filter out any undefined ASINs
    
    console.log(`Found ${asins.length} products with ASINs: ${asins.join(', ')}`)
    
    // Fetch detailed product data for each ASIN
    const productDetailsPromises = asins.map(async (asin: string) => {
      const productParams = new URLSearchParams({
        api_key: rainforestApiKey,
        type: 'product',
        amazon_domain: 'amazon.com',
        asin: asin,
        include_summarization_attributes: 'true',
        include_all_full_description: 'true',
        include_specifications: 'true',
        include_reviews: 'true',
        include_top_reviews: 'true',
        include_pricing_context: 'true',
        include_similar_products: 'true'
      })
      
      console.log(`Fetching details for ASIN ${asin} with params: ${JSON.stringify(Object.fromEntries(productParams))}`)
      
      const productResponse = await fetch(`${apiUrl}?${productParams.toString()}`)
      
      if (!productResponse.ok) {
        console.error(`Error fetching product details for ASIN ${asin}:`, await productResponse.text())
        return null
      }
      
      const productData = await productResponse.json()
      console.log(`Retrieved product data for ASIN ${asin}: ${productData.product?.title || 'Unknown'}`)
      console.log(`Features count: ${productData.product?.features?.length || 0}`)
      console.log(`Specifications groups count: ${productData.product?.specifications?.length || 0}`)
      console.log(`Reviews count: ${productData.product?.top_reviews?.length || 0}`)
      
      return productData
    })
    
    // Wait for all product detail requests to complete
    const productDetailsResults = await Promise.all(productDetailsPromises)
    
    // Filter out any failed requests
    const productDetails = productDetailsResults.filter(result => result !== null)
    
    // Transform the detailed product data
    const transformedResults = productDetails.map((data: any) => {
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
    })

    // Return the transformed results
    return new Response(JSON.stringify({ results: transformedResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Error in Rainforest API function:', error.message)
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Helper function to extract rich product description from Rainforest data
function extractRichProductDescription(product: any): string[] {
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
function extractTopReviews(product: any): any[] {
  const reviews = []
  
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
  
  return reviews
}

// Helper function to transform Rainforest product specs
function transformRainforestSpecs(product: any): Record<string, string> {
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
