
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

/**
 * Constructs the prompt for Claude with product information and analysis requirements
 */
function constructPrompt(productInfo: string, features: string[], category: string): string {
  return `I need you to analyze these ${category} products based on the features that are important to the user.

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
}

/**
 * Calls Claude API to analyze products
 */
export async function callClaudeAnalysis(productInfo: string, features: string[], category: string): Promise<any> {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    throw new Error('Claude API key is not configured');
  }

  const prompt = constructPrompt(productInfo, features, category);
  console.log('Sending request to Claude API...');
  console.log('Prompt excerpt (first 500 chars):', prompt.substring(0, 500) + '...');

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
  
  if (jsonMatch) {
    try {
      const analysisResults = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON from Claude response');
      console.log('Analysis results structure:', Object.keys(analysisResults));
      console.log('Products analyzed:', analysisResults.products.map((p: any) => p.name).join(', '));
      return analysisResults;
    } catch (e) {
      console.error('Error parsing JSON from Claude response:', e);
      throw new Error('Failed to parse Claude response as JSON');
    }
  } else {
    console.error('Could not extract JSON from Claude response');
    throw new Error('Could not extract JSON from Claude response');
  }
}
