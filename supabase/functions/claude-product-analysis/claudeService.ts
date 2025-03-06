const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

/**
 * Constructs the prompt for Claude with product information and analysis requirements
 */
function constructPrompt(productInfo: string, features: string[], category: string): string {
  return `I need you to analyze these ${category} products based on the features that are important to the user.

PRODUCTS:
${productInfo}

IMPORTANT FEATURES TO ANALYZE:
${features.join(', ')}

=== CRITICAL INSTRUCTIONS FOR SPECIFICITY ===

YOUR #1 PRIORITY IS SPECIFICITY AND DETAILED ANALYSIS:
* NEVER give vague, general, or one-line answers - they are completely unacceptable
* ALWAYS include EXACT specifications, numbers, and measurements in your analysis
* ALWAYS cite SPECIFIC data points from the product information (use direct quotes where possible)
* NEVER say a product "has good performance" without explaining EXACTLY what makes it good (e.g., "has 8GB RAM and Snapdragon 8 Gen 2 processor that's 35% faster than previous generation")
* ALWAYS compare products with SPECIFIC metrics (e.g., "Product A has 8GB RAM vs Product B's 6GB RAM, giving it 33% more memory")

PROHIBITED VAGUE STATEMENTS (NEVER USE THESE):
* "Good balance of features"
* "Great value for money"
* "High-quality build"
* "Excellent performance"
* "Good specifications"
* "Nice display"

INSTEAD, ALWAYS BE SPECIFIC:
* "Has 8GB RAM and 256GB storage, offering 2GB more memory than Product B"
* "$699 price includes 120Hz AMOLED display, while similar-priced competitors offer only 90Hz LCD"
* "Aluminum unibody construction with Gorilla Glass 7, rated for 1.5m drop protection" 
* "Snapdragon 8 Gen 2 processor with 3.2GHz clock speed, scoring 1,250 on single-core benchmarks"
* "6.7-inch 1440p OLED display with 1000 nits peak brightness and 100% DCI-P3 color coverage"
* "120Hz refresh rate with adaptive technology, providing smoother scrolling while conserving 15% more battery"

ANALYSIS INSTRUCTIONS:
1. READ THOROUGHLY: Analyze ALL available data fields for each product including description, features, specifications, and the data quality section.
2. MISSING DATA HANDLING: Many products have incomplete data. If specific data for requested features is not directly available:
   - Look for indirect mentions in descriptions or other fields
   - Use technical knowledge to identify equivalent terms or marketing names
   - Use specifications to infer capabilities
   - Clearly mark inferences as "Inferred: [reason for inference]"
   - Be honest about missing data rather than making up specifications
3. SPECIFICITY REQUIREMENT: Every single statement must include specific, quantifiable details.
4. EVIDENCE-BASED ANALYSIS: Always include direct quotations or specific references to product data to support your analysis.
5. COMPARATIVE FOCUS: Analyze meaningful differences between products for each feature, not just descriptions.

REQUIRED OUTPUT FORMAT:
For each requested feature, you must provide the following elements:
1. RAW DATA EXTRACTION: Quote the exact information found in the product data (e.g., "Processor: Snapdragon 8 Gen 2 (Source: SPECIFICATIONS_FLAT)")
2. QUANTITATIVE ASSESSMENT: Provide measurable metrics whenever possible (e.g., "15% longer battery life", "4K vs 1080p resolution") 
3. COMPARATIVE ANALYSIS: How does this compare to other products? (e.g., "Highest resolution in the comparison at 1440p vs 1080p for others")
4. REAL-WORLD IMPLICATION: What does this mean for usage? (e.g., "suitable for graphic design due to 100% sRGB coverage")
5. CONFIDENCE LEVEL: Rate your confidence in this analysis as high/medium/low based on data completeness with explanation

EXAMPLE OF REQUIRED SPECIFICITY FOR "PROCESSOR" FEATURE:
```
"Processor": {
  "rating": 9,
  "dataPoints": [
    "A15 Bionic chip (Source: KEY_TECH_SPECS)",
    "6-core CPU with 2 performance and 4 efficiency cores (Source: SPECIFICATIONS_FLAT)",
    "5-core GPU (Source: SPECIFICATIONS_FLAT)",
    "16-core Neural Engine (Source: SPECIFICATIONS_FLAT)"
  ],
  "explanation": "The A15 Bionic chip with its 6-core CPU (2 performance, 4 efficiency) and 5-core GPU provides approximately 20% better CPU performance and 30% better GPU performance compared to Product B's Snapdragon 888. In benchmark tests, similar A15 chips score around 1730 for single-core and 4600 for multi-core performance on Geekbench 5, which is 15-18% higher than the Snapdragon 888 in Product B. This translates to faster app launches, smoother multitasking, and better handling of demanding applications like video editing or 3D gaming.",
  "confidence": "high - specification is clearly listed in multiple data sources with consistent information"
}
```

EXAMPLE OF REQUIRED SPECIFICITY FOR "DISPLAY" FEATURE:
```
"Display": {
  "rating": 8,
  "dataPoints": [
    "6.1-inch Super Retina XDR display (Source: KEY_TECH_SPECS)",
    "OLED technology (Source: SPECIFICATIONS_FLAT)",
    "2532 x 1170 pixel resolution at 460 ppi (Source: SPECIFICATIONS_FLAT)",
    "HDR display with 1200 nits peak brightness (Source: SPECIFICATIONS_FLAT)",
    "True Tone display (Source: STRUCTURED_SPECIFICATIONS)"
  ],
  "explanation": "The 6.1-inch OLED display with 2532 x 1170 resolution (460 ppi) offers 18% higher pixel density than Product C's 387 ppi LCD panel. The peak brightness of 1200 nits is 50% brighter than Product B's 800 nits, providing better outdoor visibility. While the 60Hz refresh rate is lower than Product D's 120Hz panel, the OLED technology delivers perfect blacks and infinite contrast ratio compared to Product C's LCD panel with approximately 1500:1 contrast ratio. The display covers approximately 99% of the DCI-P3 color gamut based on typical Super Retina XDR specifications, making it well-suited for photo editing and HDR video consumption.",
  "confidence": "high - display specifications are comprehensive and listed in multiple data sources"
}
```

When rating features:
- Base ratings EXCLUSIVELY on objective evidence from the product data
- Use comparative criteria (is this better or worse than others in this comparison?)
- Every rating MUST include specific technical justification (e.g., "Rating: 8/10 because the 8GB RAM is 33% more than Product B, allowing better multitasking performance")
- NEVER provide generic explanations like "good performance" or "excellent quality"

For each product, please provide:
1. A detailed overview that mentions SPECIFIC key specifications and positioning (3-5 sentences with actual metrics)
2. Specific pros (3-5 bullet points) with QUANTIFIABLE advantages (include numbers, percentages, measurements)
3. Specific cons (2-4 bullet points) that highlight ACTUAL limitations with technical details
4. A rating score (1-10) for each of the important features listed above
5. A detailed explanation of each feature rating that references SPECIFIC data points

Additionally, provide personalized recommendations for different user types. For each recommendation:
1. Identify a specific user persona or use case (e.g., "Budget-conscious professional", "Creative professional", "Gamer", etc.)
2. Explain in detail (3-5 sentences) why the recommended product is ideal for this persona, with SPECIFIC examples of how features benefit them
3. NEVER use vague statements like "good balance of features, performance, and price" - instead be SPECIFIC about exactly which features matter for this user and WHY
4. Include concrete, measurable advantages (e.g., "15% longer battery life", "higher resolution display that shows 25% more detail", etc.)
5. Mention at least 2-3 specific standout features with quantifiable benefits for this user type
6. Explain any trade-offs this persona might be making with this choice
7. Suggest one key accessory or complementary product that would enhance the experience for this specific user type

Format your response as JSON with the following structure (notice the DEPTH and DETAIL required):
{
  "products": [
    {
      "name": "Product Name",
      "overview": "Comprehensive product overview with MULTIPLE specific specs, measurements, and technical context (minimum 5-7 sentences with technical details)...",
      "pros": [
        "DETAILED Pro 1 with quantifiable advantage and comparative context (e.g., '8GB LPDDR5 RAM provides 33% more memory than Product B's 6GB RAM, enabling smoother multitasking with 5-7 more background apps while maintaining responsive performance')",
        "DETAILED Pro 2 with quantifiable advantage and real-world impact (e.g., '4500mAh battery combined with 65W charging delivers up to 36 hours of regular usage and recharges from 0-58% in just 15 minutes, offering 8 more hours of use than Product C')",
        "DETAILED Pro 3 with quantifiable advantage and technical specifications (e.g., 'IP68 rating ensures water resistance up to 1.5m for 30 minutes and dust resistance, making it 50% more water-resistant than Product D's IP54 rating that only protects against splashes')",
        "DETAILED Pro 4 with quantifiable advantage and technical specifications"
      ],
      "cons": [
        "DETAILED Con 1 with technical specifications and comparative context (e.g., '60Hz refresh rate is 50% lower than the 120Hz found in similarly priced alternatives like Product B, resulting in noticeably less smooth scrolling and animations, particularly when gaming or navigating content-heavy apps')",
        "DETAILED Con 2 with technical specifications and usage implications (e.g., 'No headphone jack requires Bluetooth headphones or USB-C adapter, limiting compatibility with legacy 3.5mm audio devices and potentially introducing 20-40ms of audio latency during gaming sessions')",
        "DETAILED Con 3 with technical specifications and impact on user experience"
      ],
      "featureRatings": {
        "Feature Name": {
          "rating": 8,
          "dataPoints": [
            "Specific data point from product with exact source (e.g., '8GB RAM (Source: KEY_TECH_SPECS)')",
            "LPDDR5 memory type with clock speed (Source: SPECIFICATIONS_FLAT)",
            "UFS 3.1 storage with read/write speeds (Source: SPECIFICATIONS_FLAT)",
            "Dual-channel memory architecture (Source: INFERRED from processor capabilities)",
            "Memory expansion available up to 1TB via microSD (Source: STRUCTURED_SPECIFICATIONS)"
          ],
          "technicalDetails": {
            "rawSpecifications": "The complete technical specifications exactly as found in the source data",
            "benchmarks": "Estimated or known benchmark results based on these specifications",
            "comparativeContext": "How these specifications compare to industry standards and other products",
            "generationInfo": "Technical details about the generation or version of this feature"
          },
          "explanation": "COMPREHENSIVE and DETAILED explanation with multiple quantifiable aspects and comparative analysis. This should be at least 5-7 sentences discussing technical merits, comparative advantages/disadvantages, and real-world performance implications. Include detailed percentage comparisons with other products where possible, specific metrics that matter for this feature, and technical context about why these specifications are relevant for different use cases.",
          "usageImplications": "DETAILED analysis of what these specifications mean for various real-world usage scenarios, with at least 3-4 different use cases examined in technical detail",
          "confidence": "high/medium/low with detailed technical justification explaining exactly why this confidence level was assigned based on data quality and completeness"
        },
        "Additional Feature": {
          "rating": 7,
          "dataPoints": [
            "Multiple specific data points with sources...",
            "At least 4-5 different specifications that contribute to this feature"
          ],
          "technicalDetails": {
            "detailed technical specifications..."
          },
          "explanation": "Minimum 150+ words of detailed technical analysis for this feature...",
          "usageImplications": "Extensive usage scenario analysis...",
          "confidence": "Detailed confidence assessment..."
        }
      }
    }
  ],
  "personalizedRecommendations": [
    {
      "productId": "product-id",
      "recommendationType": "User Persona (e.g., Budget Professional)",
      "reasoning": "EXTENSIVE explanation (minimum 150+ words) why this product is best for this persona with MULTIPLE specific examples of how features meet their needs. Include DETAILED price-to-performance benefits or unique capabilities that matter for this user type, with explicit technical reasons why these capabilities matter for their specific use cases.",
      "technicalFit": "DETAILED analysis of how this product's technical specifications align with this user persona's specific requirements, with quantifiable metrics on at least 5-6 different feature dimensions",
      "standoutFeatures": [
        "Feature 1 with DETAILED quantifiable benefit and usage context (e.g., '8GB LPDDR5 RAM provides smooth multitasking for productivity applications, handling up to 25 Chrome tabs simultaneously while running Office applications with 40% less memory pressure than alternatives')",
        "Feature 2 with DETAILED quantifiable benefit and comparative advantage (e.g., '10-hour battery life ensures full workday operation without charging, offering 2.5 more hours than Product B, and the 65W charging restores 60% capacity in just 20 minutes for quick power boosts during short breaks')",
        "Feature 3 with DETAILED quantifiable benefit and technical specifications"
      ],
      "relevantTradeoffs": "COMPREHENSIVE technical trade-offs analysis this persona is making (minimum 100+ words with specific technical details, e.g., 'While the 60Hz display sacrifices smoothness for better battery life, which prioritizes productivity over gaming experience, the resulting 15% better battery efficiency provides approximately 1.5 additional hours of usage per charge. This trade-off particularly benefits document editing and research tasks that don't require high refresh rates, but will impact frame-rate-sensitive applications like action games or scrolling through content-heavy websites where the difference between 60Hz and 120Hz is noticeable (approximately 16.6ms vs 8.3ms frame times)')",
      "recommendedAccessory": "A complementary product recommendation with DETAILED technical explanation of compatibility and specific user benefits",
      "valueAnalysis": "DETAILED price-to-performance analysis with specific calculations and comparisons to alternatives"
    }
  ],
  "dataCompleteness": {
    "overallCompleteness": "DETAILED percentage or description of how complete the product data was with SPECIFIC gaps identified and an explanation of how these gaps impact the analysis quality",
    "missingKeyData": [
      "DETAILED entry for important missing data point with specific impact on analysis quality",
      "DETAILED entry for another important missing data point with specific impact",
      "Multiple additional missing data points with impact explanations..."
    ],
    "inferredData": [
      "DETAILED entry for feature where information was inferred with comprehensive reasoning for inference",
      "DETAILED entry for another inferred feature with technical basis for inference",
      "Multiple additional inferred data points with detailed justifications..."
    ],
    "confidenceAssessment": "COMPREHENSIVE evaluation of overall confidence in the analysis with specific areas of high and low confidence identified"
  },
  "comparativeAnalysis": {
    "keyDifferentiators": [
      "DETAILED technical differentiator between products with specific measurements and impact",
      "DETAILED technical differentiator between products with specific measurements and impact",
      "Multiple additional differentiators with measurements and impacts..."
    ],
    "valueComparison": "COMPREHENSIVE price-to-performance analysis across all products with specific value metrics",
    "technicalSuperiority": "DETAILED analysis of which products excel in which specific technical areas and why"
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
      system: `You are a product comparison expert specializing in thorough, detailed technical analysis. Your PRIMARY DIRECTIVE is to provide EXTREMELY SPECIFIC, DATA-DRIVEN comparisons with COMPREHENSIVE DEPTH and QUANTIFIABLE METRICS. Vague generalizations and incomplete analyses are STRICTLY PROHIBITED.

== CORE PRINCIPLES ==

RESPONSE DEPTH REQUIREMENTS (HIGHEST PRIORITY):
1. NEVER provide one-line, brief, or shallow answers - your analysis MUST be COMPREHENSIVE
2. For EACH feature requested, write a MINIMUM of 3-5 DETAILED sentences with technical specifications 
3. Include MULTIPLE data points for EVERY feature (aim for at least 4-6 specific metrics per feature)
4. THOROUGHLY analyze ALL technical implications of each specification
5. EXHAUSTIVELY compare products across MULTIPLE dimensions for each feature

SPECIFICITY REQUIREMENTS:
1. ALWAYS include EXACT numerical specifications in EVERY feature analysis (e.g., "8GB LPDDR5 RAM", "6.7-inch AMOLED display", "120Hz variable refresh rate")  
2. ALWAYS cite SPECIFIC data points from the product with their source (e.g., "Snapdragon 8 Gen 2 processor (Source: SPECIFICATIONS_FLAT)")
3. ALWAYS provide PRECISE quantitative comparisons between products (e.g., "33% more RAM", "twice the storage capacity", "50% faster charging")
4. NEVER use subjective terms without COMPREHENSIVE technical justification (e.g., never say "good camera" - instead say "48MP main camera with f/1.8 aperture, OIS, dual-pixel PDAF, and 1/1.56-inch sensor size, capable of 4K60fps video recording")
5. ALWAYS explain the technical significance of each specification in EXTENSIVE detail

PROHIBITED VAGUE OR BRIEF PATTERNS:
- Single-line or brief feature analyses 
- "Good balance of features" without specific metrics
- "Great value" without detailed price-to-performance calculations
- "High-quality" without objective quality measurements
- "Excellent performance" without benchmark comparisons
- "Good specifications" without listing each relevant specification
- "Nice display" without complete display metrics
- Any subjective assessment without EXTENSIVE technical measurements
- Any feature analysis shorter than 3-5 detailed sentences

REQUIRED COMPREHENSIVENESS EXAMPLES:
✓ "Memory: 8GB LPDDR5 RAM (6400MHz) with 256GB UFS 3.1 storage, providing sequential read speeds of approximately 2,100MB/s and write speeds of 1,200MB/s. The LPDDR5 RAM offers approximately 50% higher bandwidth than the LPDDR4X in Product B, enabling smoother multitasking with up to 20% more background apps. The UFS 3.1 storage provides approximately 2x faster data access than the UFS 2.1 storage in Product C, resulting in noticeably faster app loading and file transfer times."

✓ "Display: 6.7-inch AMOLED display with 1440 x 3088 resolution (525 PPI), 120Hz variable refresh rate (10-120Hz), HDR10+ certification, 1300 nits peak brightness, 100% DCI-P3 color gamut coverage, and Gorilla Glass Victus protection. Compared to Product B's 6.4-inch LCD (410 PPI), this display offers 28% higher pixel density for sharper text and images, 62.5% higher peak brightness (1300 nits vs 800 nits) for better outdoor visibility, and perfect blacks due to OLED technology versus the approximately 1500:1 contrast ratio of Product B's LCD panel. The variable refresh rate conserves approximately 15-20% battery life compared to fixed 120Hz displays while still providing the smoothness benefits of high refresh rate."

FORMAT REQUIREMENTS:
- Format your entire response as valid JSON with no extra text
- For each feature, include EXTENSIVE raw data points found AND their detailed interpretation
- Structure your analysis to highlight multiple technical differences between products
- Include exact quotes from product descriptions or specifications with source attribution
- Address EVERY aspect of each feature in detail (e.g., for displays: size, technology, resolution, refresh rate, brightness, color gamut, etc.)

DATA QUALITY & INFERENCE REQUIREMENTS:
- THOROUGHLY document all data gaps and their impact on your analysis
- When data is missing, use remaining data to make reasonable inferences based on technical knowledge
- Explicitly label all inferences as "Inferred: [detailed reasoning]"
- Never make up specifications without explicitly stating they are estimated and providing extensive reasoning
- Indicate confidence level (high/medium/low) with detailed technical justification for each rating

THOROUGH ANALYSIS METHODOLOGY:
1. Extract ALL relevant data points from ALL sections of the product information
2. Compare products using MULTIPLE specific numerical differences for EACH feature
3. Explain the DETAILED TECHNICAL significance of these differences for VARIOUS use cases
4. Provide COMPREHENSIVE real-world performance implications based on ALL technical specifications
5. EXHAUSTIVELY analyze pros and cons for EACH feature across ALL products

CRITICAL: Your analysis MUST be COMPREHENSIVE and THOROUGH, with MULTIPLE SPECIFIC TECHNICAL DETAILS in EVERY statement. Users require IN-DEPTH analysis with COMPLETE technical context to make informed decisions. ONE-LINE or BRIEF analyses are COMPLETELY UNACCEPTABLE and will be rejected.`
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