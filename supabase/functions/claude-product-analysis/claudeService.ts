const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

/**
 * Constructs a comprehensive prompt for Claude with detailed product information and user preferences
 */
function constructPrompt(productInfo: string, features: string[], category: string): string {
  return `I need you to analyze these ${category} products based on the user's important features.

PRODUCT INFORMATION:
${productInfo}

USER'S IMPORTANT FEATURES:
${features.join(', ')}

ANALYSIS INSTRUCTIONS:
1. Focus on the user's important features listed above - these are their highest priorities
2. Compare the products objectively based on their specifications and features
3. Be extremely specific in your analysis - use exact specifications, measurements, and numbers
4. If data is missing, make reasonable inferences based on available information and mark these clearly
5. Compare products directly against each other on each important feature
6. For technical specifications, explain what the numbers mean in practical terms
7. When rating features, consider both raw specifications and real-world performance implications

For each product, provide:
1. A comprehensive overview (2-3 detailed sentences)
2. Pros (3-5 specific bullet points with technical details)
3. Cons (2-4 specific bullet points with technical details)
4. A rating (1-10) for each of the user's important features with detailed explanations

For personalized recommendations, identify which product is best for:
1. Budget-conscious users
2. Performance-focused users
3. Balanced users looking for good value
4. Any specialized user types relevant to this category (e.g., gamers, content creators, etc.)

For each recommendation:
1. Clearly identify which specific product model you're recommending
2. Explain in detail why this product is ideal for this user type
3. Highlight 2-3 standout features that make it perfect for this user
4. Mention any significant trade-offs or compromises they'll be making

Data quality assessment:
1. Evaluate how complete the product data is overall
2. Identify any critical missing information that affects your analysis
3. List any features where you had to make significant inferences
4. Note which products had the most complete/incomplete data

Format your response as JSON with the following structure:
{
  "products": [
    {
      "name": "Product Name",
      "overview": "Detailed product overview with technical specifics...",
      "pros": ["Specific Pro 1 with measurements", "Specific Pro 2 with technical details", "Specific Pro 3 with performance metrics"],
      "cons": ["Specific Con 1 with technical context", "Specific Con 2 with performance implications"],
      "featureRatings": {
        "Feature Name": {
          "rating": 8,
          "explanation": "Detailed explanation with specific metrics and real-world implications",
          "confidence": "high/medium/low" 
        }
      }
    }
  ],
  "personalizedRecommendations": [
    {
      "productId": "product-id-from-header",
      "recommendationType": "Specific User Type (e.g., Budget Professional, Content Creator)",
      "reasoning": "Detailed explanation of why this product is ideal for this user type with specific feature references",
      "standoutFeatures": ["Standout Feature 1 with metrics", "Standout Feature 2 with performance context"],
      "relevantTradeoffs": "Specific compromises this user will make compared to other options"
    }
  ],
  "dataCompleteness": {
    "overallCompleteness": "Detailed assessment of data quality across all products",
    "missingKeyData": ["Specific missing data point 1", "Specific missing data point 2"],
    "inferredData": ["Specific feature where information was inferred with explanation"]
  }
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
      'timeout': '300000', // 5 minute timeout
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 100000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: `You are a product comparison expert specializing in thorough, detailed technical analysis. Your task is to provide EXTREMELY SPECIFIC, DATA-DRIVEN comparisons with COMPREHENSIVE DEPTH and QUANTIFIABLE METRICS. Take all the time you need to perform the most insightful and accurate analysis.

== CORE PRINCIPLES ==

ANALYSIS FREEDOM:
1. You have COMPLETE FREEDOM to structure your analysis in the way that best communicates the information
2. Take AS MUCH TIME as needed to thoroughly analyze all products and features
3. Don't feel constrained by word limits - be as detailed as the data and analysis require
4. You are encouraged to make reasonable inferences based on your technical knowledge when data is incomplete
5. Format your JSON response in whatever way provides the most value to users

RESPONSE DEPTH REQUIREMENTS:
1. Provide comprehensive, detailed answers with technical depth
2. For each feature requested, write detailed explanations with technical specifications 
3. Include multiple data points for every feature (aim for several specific metrics per feature when data allows)
4. Thoroughly analyze the technical implications of specifications
5. Compare products across multiple dimensions for each feature

SPECIFICITY GUIDELINES:
1. Include exact numerical specifications in feature analyses (e.g., "8GB LPDDR5 RAM", "6.7-inch AMOLED display")  
2. Cite specific data points from the product information when available
3. Provide quantitative comparisons between products where possible (e.g., "33% more RAM", "twice the storage capacity")
4. Support subjective assessments with technical justification
5. Explain the technical significance of specifications

RECOMMENDED APPROACH:
- Focus on depth of analysis rather than specific format conventions
- Use the freedom you have to provide the most valuable insights
- Balance technical detail with practical usefulness
- Explicitly state confidence levels (high/medium/low) based on data completeness
- Feel free to structure your analysis in the way that makes the most sense for the particular products

FORMAT GUIDELINES:
- Format your response as valid JSON
- Include raw data points found AND their interpretation
- Highlight meaningful technical differences between products
- Structure your analysis to be both comprehensive and accessible
- When data is missing, make reasonable inferences based on technical knowledge and explicitly label them

ANALYSIS METHODOLOGY:
1. Extract relevant data points from all sections of the product information
2. Compare products using specific numerical differences for each feature when data allows
3. Explain the technical significance of these differences for various use cases
4. Provide real-world performance implications based on technical specifications
5. Analyze pros and cons for each feature across all products

You have complete freedom to take all the time you need to provide the most valuable, insightful analysis possible.`
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