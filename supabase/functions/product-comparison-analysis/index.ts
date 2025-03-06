import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatProductDataForAnalysis } from "./productFormatter.ts";
import { performProductAnalysis } from "./productAnalysisService.ts";
import { corsHeaders } from "./utils.ts";

// Set longer timeout for the edge function to allow Claude time for thorough analysis
const FUNCTION_TIMEOUT = 600000; // 10 minutes in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { products, userSelectedFeatures, category } = body;

    console.log('Analyzing products:', products.map((p: any) => p.name || 'Unknown').join(', '));
    console.log('User-selected features:', userSelectedFeatures.join(', '));
    console.log('Category:', category);

    // Validate inputs
    if (!products || !Array.isArray(products) || products.length < 2) {
      throw new Error('At least two products are required for analysis');
    }

    if (!userSelectedFeatures || !Array.isArray(userSelectedFeatures) || userSelectedFeatures.length === 0) {
      throw new Error('At least one user-selected feature is required for analysis');
    }

    // Format product data for analysis using the detailed formatter
    const formattedProductData = formatProductDataForAnalysis(products);
    
    // Log formatted data details
    console.log('Formatted product data for analysis:');
    console.log(`- Number of products: ${formattedProductData.length}`);
    console.log(`- Total data size: ${JSON.stringify(formattedProductData).length} characters`);

    // Log important details before making the API call
    console.log(`Sending detailed analysis request for ${products.length} products comparing ${userSelectedFeatures.length} features in category: ${category}`);
    
    try {
      // Perform the actual product analysis with Claude
      const analysisResults = await performProductAnalysis(
        formattedProductData, 
        userSelectedFeatures, 
        category
      );
      
      // Log basic statistics about the results
      if (analysisResults && analysisResults.productOverviews) {
        console.log(`Product analysis complete. Received data for ${analysisResults.productOverviews.length} products.`);
        
        // Log feature comparisons
        if (analysisResults.featureComparisons) {
          console.log(`Feature comparisons analyzed: ${analysisResults.featureComparisons.length}`);
          analysisResults.featureComparisons.forEach((feature) => {
            console.log(`- ${feature.featureName} comparison complete`);
          });
        }
        
        // Log analysis metadata
        if (analysisResults.analysisMetadata) {
          console.log(`Analysis completeness level: ${analysisResults.analysisMetadata.completenessLevel}/10`);
          console.log(`Inferences made: ${analysisResults.analysisMetadata.inferencesMade?.length || 0}`);
        }
      } else {
        console.warn('The AI returned an unexpected response structure');
      }
      
      return new Response(JSON.stringify(analysisResults), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Product analysis failed:', error);
      console.error('Error details:', error.stack || 'No stack trace available');
      throw error; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error in product-comparison-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});