
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key is not configured');
    }

    const { products, features, category } = await req.json();

    console.log('Analyzing products:', products.map((p: any) => p.name).join(', '));
    console.log('Important features:', features.join(', '));
    console.log('Category:', category);

    if (!products || !Array.isArray(products) || products.length < 2) {
      throw new Error('At least two products are required for analysis');
    }

    if (!features || !Array.isArray(features) || features.length === 0) {
      throw new Error('At least one feature is required for analysis');
    }

    // Prepare product information for Claude
    const productInfo = products.map(product => {
      const { name, brand, price, specs } = product;
      const specsText = specs ? Object.entries(specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n  ') : 'No specifications available';
      
      return `Product: ${name}
Brand: ${brand || 'Unknown'}
Price: $${price || 'Unknown'}
Specifications:
  ${specsText}`;
    }).join('\n\n');

    // Construct the prompt for Claude
    const prompt = `I need you to analyze these ${category} products based on the features that are important to the user.

PRODUCTS:
${productInfo}

IMPORTANT FEATURES:
${features.join(', ')}

Please provide the following for each product:
1. A brief overview of each product (2-3 sentences)
2. Pros (3-5 bullet points)
3. Cons (2-4 bullet points)
4. A rating score (1-10) for each of the important features listed above
5. A brief explanation of the feature ratings (1-2 sentences each)

Format your response as JSON with the following structure:
{
  "products": [
    {
      "name": "Product Name",
      "overview": "Brief product overview...",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "featureRatings": {
        "Feature Name": {
          "rating": 8,
          "explanation": "Why this feature got this rating"
        }
      }
    }
  ]
}`;

    console.log('Sending request to Claude API...');

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: "You are a product comparison expert. Provide factual, honest analysis based only on the information given. Format your entire response as valid JSON with no extra text. Focus on technical merits rather than marketing claims."
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const claudeResponse = await response.json();
    console.log('Received response from Claude API');

    // Extract the content from Claude's response
    const content = claudeResponse.content;
    const textContent = content[0].text;
    
    // Find the JSON part of the response (Claude might add extra text)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    let analysisResults;
    
    if (jsonMatch) {
      try {
        analysisResults = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing JSON from Claude response:', e);
        throw new Error('Failed to parse Claude response as JSON');
      }
    } else {
      throw new Error('Could not extract JSON from Claude response');
    }

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
