
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the request body
    const { productName, category } = await req.json()
    
    // Validate input
    if (!productName || !category) {
      return new Response(
        JSON.stringify({ error: 'Product name and category are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Generating features for ${productName} in category ${category}`)
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Generate mock pros and cons for now
    // In a real implementation, this could use an AI API or a database of product reviews
    const pros = generatePros(productName, category)
    const cons = generateCons(productName, category)
    
    // Return the generated pros and cons
    return new Response(
      JSON.stringify({ 
        pros, 
        cons,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating product features:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate product features' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper function to generate mock pros
function generatePros(productName: string, category: string): string[] {
  const commonPros = [
    'Good value for money',
    'Excellent build quality',
    'User-friendly interface'
  ]
  
  const categoryProMap: Record<string, string[]> = {
    'Smartphones': [
      'Impressive camera quality',
      'Long battery life',
      'Fast performance',
      'Beautiful display'
    ],
    'Laptops': [
      'Powerful processor',
      'Lightweight and portable',
      'Great keyboard',
      'Excellent display'
    ],
    'Headphones': [
      'Superb sound quality',
      'Effective noise cancellation',
      'Comfortable to wear',
      'Long battery life'
    ],
    'TVs': [
      'Vibrant picture quality',
      'Slim design',
      'Smart features',
      'Good sound quality'
    ]
  }
  
  const categorySpecificPros = categoryProMap[category] || []
  
  // Take 2-3 random pros from each list
  const selectedCommonPros = shuffleAndTake(commonPros, Math.floor(Math.random() * 2) + 1)
  const selectedCategoryPros = shuffleAndTake(categorySpecificPros, Math.floor(Math.random() * 3) + 1)
  
  return [...selectedCategoryPros, ...selectedCommonPros]
}

// Helper function to generate mock cons
function generateCons(productName: string, category: string): string[] {
  const commonCons = [
    'Relatively expensive',
    'Limited warranty',
    'Customer service could be better'
  ]
  
  const categoryConMap: Record<string, string[]> = {
    'Smartphones': [
      'Battery drains quickly with heavy use',
      'Limited storage options',
      'Camera struggles in low light',
      'Average speaker quality'
    ],
    'Laptops': [
      'Runs hot under load',
      'Limited port selection',
      'Average battery life',
      'Fan noise can be distracting'
    ],
    'Headphones': [
      'Slightly uncomfortable after long use',
      'Average microphone quality',
      'Bulky design',
      'Limited codec support'
    ],
    'TVs': [
      'Limited viewing angles',
      'Mediocre built-in speakers',
      'Complicated menu system',
      'Limited app selection'
    ]
  }
  
  const categorySpecificCons = categoryConMap[category] || []
  
  // Take 1-2 random cons from each list
  const selectedCommonCons = shuffleAndTake(commonCons, 1)
  const selectedCategoryCons = shuffleAndTake(categorySpecificCons, Math.floor(Math.random() * 2) + 1)
  
  return [...selectedCategoryCons, ...selectedCommonCons]
}

// Helper function to shuffle an array and take n elements
function shuffleAndTake<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
