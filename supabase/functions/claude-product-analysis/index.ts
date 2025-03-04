
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatProductsForPrompt } from "./productFormatter.ts";
import { callClaudeAnalysis } from "./claudeService.ts";
import { generateMockData } from "./mockData.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { products, features, category } = body;

    console.log('Analyzing products:', products.map((p: any) => p.name).join(', '));
    console.log('Important features:', features.join(', '));
    console.log('Category:', category);

    // Validate inputs
    if (!products || !Array.isArray(products) || products.length < 2) {
      throw new Error('At least two products are required for analysis');
    }

    if (!features || !Array.isArray(features) || features.length === 0) {
      throw new Error('At least one feature is required for analysis');
    }

    // Log incoming data structure
    console.log('First product raw data structure:', JSON.stringify(products[0].rawData || {}, null, 2).substring(0, 1000) + '...');
    
    // Extract and log focused Rainforest API parameters for the first product
    const firstProduct = products[0];
    console.log('First product description available:', !!firstProduct.description);
    console.log('First product feature_bullets_flat available:', !!(firstProduct.rawData?.feature_bullets_flat));
    console.log('First product specifications_flat available:', !!(firstProduct.rawData?.specifications_flat));

    // Format product data for Claude prompt
    const productInfo = formatProductsForPrompt(products);

    // Use mock data if configured
    if (Deno.env.get('USE_MOCK_DATA') === 'true') {
      console.log('Using mock data instead of Claude API response');
      const mockResults = generateMockData(products, features);
      
      return new Response(JSON.stringify(mockResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Claude API for analysis
    const analysisResults = await callClaudeAnalysis(productInfo, features, category);

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in claude-product-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
