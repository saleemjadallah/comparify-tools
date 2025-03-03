
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
    const { searchQuery, categoryName } = await req.json()
    
    if (!searchQuery || !categoryName) {
      throw new Error('Missing required parameters: searchQuery and categoryName')
    }

    // Get Rainforest API key from Supabase secrets
    const rainforestApiKey = Deno.env.get('RAINFOREST_API_KEY')
    
    if (!rainforestApiKey) {
      throw new Error('Rainforest API key is not configured')
    }

    // Convert category name to Amazon ASIN prefix as needed
    const categoryMapping: Record<string, string> = {
      'Smartphones': 'B0',
      'Laptops': 'B0',
      'Headphones': 'B0',
      'TVs': 'B0',
      'Cameras': 'B0',
      'Smartwatches': 'B0',
      'Gaming Consoles': 'B0',
      'Smart Home Devices': 'B0',
      'Tablets': 'B0',
    }

    // Prepare Rainforest API request
    const apiUrl = 'https://api.rainforestapi.com/request'
    const params = new URLSearchParams({
      api_key: rainforestApiKey,
      type: 'search',
      amazon_domain: 'amazon.com',
      search_term: `${searchQuery} ${categoryName}`,
      include_summarization_attributes: 'true' // Add this parameter to get more detailed product info
    })

    console.log(`Searching Rainforest API for: ${searchQuery} in category ${categoryName} with summarization attributes`)
    
    // Make the request to Rainforest API
    const response = await fetch(`${apiUrl}?${params.toString()}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Rainforest API error:', errorText)
      throw new Error(`Rainforest API error: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    
    // Transform the response to match our ProductSearchResult format
    const transformedResults = data.search_results.map((item: any) => ({
      id: item.asin || `rainforest-${crypto.randomUUID()}`,
      name: item.title || 'Unknown Product',
      brand: item.brand || '',
      price: item.price?.value || 0,
      category: categoryName,
      rating: item.rating,
      specs: transformRainforestSpecs(item),
      imageUrl: item.image || '',
      source: 'rainforest',
      source_id: item.asin || '',
    }))

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

// Helper function to transform Rainforest product specs
function transformRainforestSpecs(item: any): Record<string, string> {
  const specs: Record<string, string> = {}
  
  // Add basic specifications
  if (item.price?.currency) specs['Currency'] = item.price.currency
  if (item.rating) specs['Rating'] = item.rating.toString()
  if (item.ratings_total) specs['Total Reviews'] = item.ratings_total.toString()
  if (item.is_prime) specs['Prime'] = item.is_prime ? 'Yes' : 'No'
  if (item.delivery?.is_free) specs['Free Delivery'] = item.delivery.is_free ? 'Yes' : 'No'
  
  // Add summarization attributes if available
  if (item.summarization_attributes && Array.isArray(item.summarization_attributes)) {
    item.summarization_attributes.forEach((attr: any) => {
      if (attr.name && attr.value) {
        specs[attr.name] = attr.value;
      }
    });
  }
  
  // Add any additional specifications from the features array
  if (item.features && Array.isArray(item.features)) {
    item.features.forEach((feature: string, index: number) => {
      const parts = feature.split(':')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        specs[key] = value
      } else if (feature.trim()) {
        specs[`Feature ${index + 1}`] = feature.trim()
      }
    })
  }
  
  return specs
}
