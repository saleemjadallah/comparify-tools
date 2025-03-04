
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders, handleOptions } from './cors.ts'
import { searchProducts } from './search.ts'
import { getProductDetails } from './product-details.ts'
import { transformResults } from './transformers.ts'

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions()
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

    console.log(`Searching Rainforest API for: ${searchQuery} in category ${categoryName}`)
    
    // Step 1: Search for products
    const searchData = await searchProducts(rainforestApiKey, searchQuery, categoryName)
    
    // Extract ASINs from search results (limit to top N results)
    const asins = searchData.search_results
      .slice(0, limit)
      .map((item: any) => item.asin)
      .filter((asin: string) => asin) // Filter out any undefined ASINs
    
    console.log(`Found ${asins.length} products with ASINs: ${asins.join(', ')}`)
    
    if (asins.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Step 2: Fetch detailed product data for each ASIN
    const productDetailsResults = await Promise.all(
      asins.map(asin => getProductDetails(rainforestApiKey, asin))
    )
    
    // Filter out any failed requests
    const productDetails = productDetailsResults.filter(result => result !== null)
    
    // Step 3: Transform the detailed product data
    const transformedResults = transformResults(productDetails, categoryName)

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
