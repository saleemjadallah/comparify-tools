
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
      console.error('Claude API key is not configured');
      throw new Error('Claude API key is not configured');
    }

    // Parse the request body
    const body = await req.json();
    const { products, features, category } = body;

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
    const productInfo = products.map((product: any) => {
      const { name, brand, price, specs } = product;
      let specsText = 'No specifications available';
      
      if (specs && typeof specs === 'object') {
        specsText = Object.entries(specs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n  ');
      }
      
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

Additionally, provide personalized recommendations for different user types. For each recommendation:
1. Identify a specific user persona or use case (e.g., "Budget-conscious professional", "Creative professional", "Gamer", etc.)
2. Explain in detail (3-5 sentences) why the recommended product is ideal for this persona, going beyond just mentioning "good balance of features, performance, and price"
3. Highlight the specific standout features that make this product appropriate for this user persona
4. Explain any trade-offs this persona might be making with this choice
5. Suggest one key accessory or complementary product that would enhance the experience for this specific user type

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
  ],
  "personalizedRecommendations": [
    {
      "productId": "product-id",
      "recommendationType": "User Persona (e.g., Budget Professional)",
      "reasoning": "Detailed explanation why this product is best for this persona with specific examples of how the features meet their needs. Include specific price-to-performance benefits or unique capabilities that matter to this user type.",
      "standoutFeatures": ["Feature 1", "Feature 2"],
      "relevantTradeoffs": "What this user gives up by choosing this option",
      "recommendedAccessory": "A complementary product that would enhance the experience"
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
        system: "You are a product comparison expert with deep knowledge of consumer electronics and technology. Provide detailed, nuanced analysis based only on the information given, highlighting meaningful differences between products rather than superficial distinctions. Format your entire response as valid JSON with no extra text. Your analysis should be specific and actionable, helping users make informed purchasing decisions based on their unique needs. Avoid vague statements like 'good balance of features, performance, and price' - instead, explain precisely what makes each recommendation appropriate with concrete examples."
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
        console.log('Successfully parsed JSON from Claude response');
      } catch (e) {
        console.error('Error parsing JSON from Claude response:', e);
        throw new Error('Failed to parse Claude response as JSON');
      }
    } else {
      console.error('Could not extract JSON from Claude response');
      throw new Error('Could not extract JSON from Claude response');
    }

    // Create mock data if needed (for testing without using Claude API credits)
    if (Deno.env.get('USE_MOCK_DATA') === 'true') {
      console.log('Using mock data instead of Claude API response');
      analysisResults = {
        products: products.map((product: any) => ({
          name: product.name,
          overview: `This is a high-quality ${category} that offers good value for money.`,
          pros: [
            `Great ${features[0]} performance`,
            `Excellent ${features[1]} capabilities`,
            `Good overall build quality`
          ],
          cons: [
            `Could improve on ${features[2]}`,
            `Price is slightly higher than competitors`
          ],
          featureRatings: Object.fromEntries(
            features.map(feature => [
              feature, 
              {
                rating: Math.floor(Math.random() * 3) + 7, // Random rating between 7-9
                explanation: `This product performs ${['well', 'admirably', 'excellently'][Math.floor(Math.random() * 3)]} on this feature.`
              }
            ])
          )
        })),
        personalizedRecommendations: products.map((product: any, index: number) => ({
          productId: product.id,
          recommendationType: [`Budget-conscious user`, `Professional user`, `High-end enthusiast`][index % 3],
          reasoning: `This product provides an exceptional combination of performance in ${features[0]} and affordability, making it perfect for users who need reliability without breaking the bank. The ${features[1]} capability is particularly impressive given the price point, and users will appreciate the intuitive interface that requires minimal setup time.`,
          standoutFeatures: [features[index % features.length], features[(index + 1) % features.length]],
          relevantTradeoffs: `Users choosing this product may sacrifice some advanced ${features[2]} capabilities found in premium alternatives, but the core functionality remains excellent.`,
          recommendedAccessory: `A protective case would complement this ${category} well, enhancing durability for daily use.`
        }))
      };
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
