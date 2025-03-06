import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatProductsForPrompt } from "./productFormatter.ts";
import { callClaudeAnalysis } from "./claudeService.ts";
import { generateMockData } from "./mockData.ts";
import { corsHeaders } from "./utils.ts";

// Set longer timeout for the edge function to allow Claude time to analyze
const FUNCTION_TIMEOUT = 300000; // 5 minutes in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { products, features, category } = body;

    console.log('Analyzing products:', products.map((p: any) => p.name || 'Unknown').join(', '));
    console.log('Important features:', features.join(', '));
    console.log('Category:', category);

    // Validate inputs
    if (!products || !Array.isArray(products) || products.length < 2) {
      throw new Error('At least two products are required for analysis');
    }

    if (!features || !Array.isArray(features) || features.length === 0) {
      throw new Error('At least one feature is required for analysis');
    }

    // Format product data for Claude prompt
    const productInfo = formatProductsForPrompt(products);
    
    // Log prompt details
    console.log('Prompt length for Claude:', productInfo.length);
    console.log('Sample of product info (first 500 chars):', productInfo.substring(0, 500));

    // Debug mode logging
    if (Deno.env.get('DEBUG_CLAUDE') === 'true') {
      console.log('DEBUG MODE: Full Claude prompt:');
      console.log('-------------------------');
      console.log(productInfo);
      console.log('-------------------------');
      
      console.log('Features requested for analysis:');
      features.forEach((feature, index) => {
        console.log(`  ${index + 1}. ${feature}`);
      });
      
      console.log('Product category:', category);
    }

    // Use mock data if configured
    if (Deno.env.get('USE_MOCK_DATA') === 'true') {
      console.log('Using mock data instead of Claude API response');
      const mockResults = generateMockData(products, features);
      
      return new Response(JSON.stringify(mockResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log important details before making the API call
    console.log(`Sending analysis request to Claude for ${products.length} products comparing ${features.length} features in category: ${category}`);
    
    try {
      // Call Claude API for analysis with enough time for a detailed response
      const analysisResults = await callClaudeAnalysis(productInfo, features, category);
      
      // Log basic statistics about the results
      if (analysisResults && analysisResults.products) {
        console.log(`Claude analysis complete. Received data for ${analysisResults.products.length} products.`);
        
        // Log details about feature ratings
        if (analysisResults.products[0]?.featureRatings) {
          console.log('Feature ratings received:');
          Object.keys(analysisResults.products[0].featureRatings).forEach(feature => {
            const rating = analysisResults.products[0].featureRatings[feature];
            console.log(`  - ${feature}: ${rating.rating}/10 (Confidence: ${rating.confidence})`);
          });
        }
        
        // Check for data completeness info
        if (analysisResults.dataCompleteness) {
          console.log('Data completeness assessment:', analysisResults.dataCompleteness.overallCompleteness);
          if (analysisResults.dataCompleteness.missingKeyData && analysisResults.dataCompleteness.missingKeyData.length > 0) {
            console.log('Missing key data identified:', analysisResults.dataCompleteness.missingKeyData.join(', '));
          }
        }
      } else {
        console.warn('Claude returned an unexpected response structure:', Object.keys(analysisResults || {}).join(', '));
      }
      
      return new Response(JSON.stringify(analysisResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Claude API call failed:', error);
      console.error('Error details:', error.stack || 'No stack trace available');
      throw error; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error in claude-product-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});