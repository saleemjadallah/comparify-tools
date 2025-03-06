import { FormattedProductData } from "./productFormatter.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

/**
 * Constructs a detailed prompt for Claude with comprehensive product data and user preferences
 */
function constructProductAnalysisPrompt(
  formattedProducts: FormattedProductData[],
  userSelectedFeatures: string[],
  category: string
): string {
  // Create a detailed product section for each product
  const productSections = formattedProducts.map((product, index) => {
    // Format the features section
    const featuresSection = product.features.length > 0
      ? `FEATURES:\n${product.features.map(f => `- ${f}`).join('\n')}`
      : 'FEATURES: No specific feature bullets available';

    // Format the specifications section
    let specificationsSection = 'SPECIFICATIONS:';
    
    // Group specifications by category where possible
    const groupedSpecs: Record<string, string[]> = {};
    const ungroupedSpecs: string[] = [];
    
    for (const [key, value] of Object.entries(product.specifications)) {
      // Skip nested objects which we'll handle separately
      if (typeof value === 'object' && value !== null) continue;
      
      // Check if this is a categorized spec (e.g. "Display.Resolution")
      const match = key.match(/^([^.]+)\.(.+)$/);
      
      if (match) {
        const [_, category, specName] = match;
        if (!groupedSpecs[category]) {
          groupedSpecs[category] = [];
        }
        groupedSpecs[category].push(`${specName}: ${value}`);
      } else {
        ungroupedSpecs.push(`${key}: ${value}`);
      }
    }
    
    // Add grouped specifications
    Object.entries(groupedSpecs).forEach(([category, specs]) => {
      specificationsSection += `\n${category}:\n`;
      specs.forEach(spec => {
        specificationsSection += `  - ${spec}\n`;
      });
    });
    
    // Add any ungrouped specifications
    if (ungroupedSpecs.length > 0) {
      specificationsSection += '\nOther Specifications:\n';
      ungroupedSpecs.forEach(spec => {
        specificationsSection += `  - ${spec}\n`;
      });
    }
    
    // Format the key tech specs section if available
    const keyTechSpecsSection = product.keyTechSpecs && Object.keys(product.keyTechSpecs).length > 0
      ? `\nKEY TECHNICAL SPECIFICATIONS:\n${Object.entries(product.keyTechSpecs).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`
      : '';

    // Format reviews section if available
    let reviewsSection = '';
    if (product.reviews) {
      reviewsSection = `\nREVIEWS:\n- Overall Rating: ${product.reviews.rating}/5 (from ${product.reviews.reviewCount} reviews)`;
      
      if (product.reviews.topReviews && product.reviews.topReviews.length > 0) {
        reviewsSection += '\n\nSample Reviews:';
        product.reviews.topReviews.forEach(review => {
          reviewsSection += `\n- [${review.rating}/5] ${review.title}\n  "${review.text.substring(0, 200)}${review.text.length > 200 ? '...' : ''}"`;
        });
      }
    }
    
    // Format dimensions section if available
    let dimensionsSection = '';
    if (product.dimensions && Object.keys(product.dimensions).length > 0) {
      dimensionsSection = '\n\nDIMENSIONS & PHYSICAL CHARACTERISTICS:';
      Object.entries(product.dimensions).forEach(([key, value]) => {
        dimensionsSection += `\n- ${key}: ${value}`;
      });
    }
    
    // Build complete product section
    return `PRODUCT #${index + 1}: ${product.name} (ID:${product.id})
BRAND: ${product.brand}
PRICE: ${typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price} ${product.currency || ''}
CATEGORY: ${product.category || category}

DESCRIPTION:
${product.description}

${featuresSection}

${specificationsSection}
${keyTechSpecsSection}
${dimensionsSection}
${reviewsSection}
`;
  }).join('\n\n' + '-'.repeat(80) + '\n\n');

  // Create the full prompt
  return `# Product Analysis Request

## Products to Compare
${productSections}

## User-Selected Important Features
The user has indicated that the following features are particularly important for this comparison:
${userSelectedFeatures.map(feature => `- ${feature}`).join('\n')}

## Product Category
These products are in the "${category}" category.

## Analysis Requirements

Please provide a comprehensive, data-driven comparison of these products with emphasis on the user-selected features. Your analysis should include:

1. Product Overviews: For each product, provide a comprehensive overview (3-5 sentences) capturing its positioning, key strengths, target market, key specifications, pricing, and general market reception.

2. Feature-by-Feature Comparison: For each user-selected feature, provide a direct side-by-side comparison explaining technical details, practical implications, performance differences, and which product performs better in this area and why.

3. Strengths and Weaknesses: For each product, identify 4-6 key strengths and 3-5 notable limitations with explanations of why they matter, supported by evidence from specifications or reviews.

4. Value Assessment: For each product, analyze price-to-performance, value relative to similar products, long-term value considerations, total cost of ownership, and price history context.

5. User Persona Recommendations: Create 2-4 distinct user personas, identifying which product would be best for each type of user with detailed explanations, specific ideal features, potential concerns, and complementary accessory suggestions.

6. Expert Verdict: Provide an overall assessment of which product offers the best overall value, superior technical specifications, would be most satisfying for most users, specific scenarios where one product clearly outperforms others, and a balanced conclusion acknowledging trade-offs.

## Analysis Guidelines

- Provide depth over brevity with thorough, detailed analysis
- Interpret technical specifications in practical terms for actual user experience
- Acknowledge strengths and weaknesses of all products, even when one appears superior
- When data is missing, make reasonable inferences but clearly mark them as such
- Focus on how specifications translate to user experience rather than just comparing numbers

Your output should be comprehensive, detailed, and presented in a structured, easy-to-navigate format.`;
}

/**
 * Builds a system prompt for Claude to guide the analysis approach
 */
function buildSystemPrompt(): string {
  return `You are a product comparison expert specializing in comprehensive, data-driven technical analysis. Your task is to provide an extremely thorough, insightful, and objective comparison of products based on user-selected features.

When analyzing products:
1. Focus on translating technical specifications into practical implications for different types of users
2. Provide concrete comparisons using specific metrics whenever possible (e.g., "33% more RAM" rather than "more RAM")
3. Be balanced and fair in your assessments, acknowledging both strengths and weaknesses of all products
4. Make reasonable inferences where data is incomplete, but clearly mark these as inferences
5. Structure your response carefully according to the required format for optimal readability

Always respond in the following JSON format with these key sections:

1. productOverviews: Detailed information about each product
2. featureComparisons: Direct comparisons of products for each user-selected feature
3. strengthsWeaknesses: Key advantages and limitations of each product
4. valueAssessments: Analysis of value, price-performance, and long-term considerations
5. userPersonas: Tailored recommendations for different user types
6. expertVerdict: Overall assessment and recommendations
7. analysisMetadata: Information about data completeness and inferences made

Your analysis should be comprehensive, technically accurate, and directly helpful for making informed purchase decisions.`;
}

/**
 * Performs detailed product analysis using Claude AI
 */
export async function performProductAnalysis(
  formattedProducts: FormattedProductData[],
  userSelectedFeatures: string[],
  category: string
): Promise<any> {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    throw new Error('Claude API key is not configured');
  }

  // Construct the detailed product analysis prompt
  const prompt = constructProductAnalysisPrompt(formattedProducts, userSelectedFeatures, category);
  
  console.log('Sending detailed product analysis request to Claude API...');
  console.log('Prompt length:', prompt.length, 'characters');
  console.log('Prompt excerpt (first 500 chars):', prompt.substring(0, 500) + '...');

  // Make the API call to Claude
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 100000,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: buildSystemPrompt()
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