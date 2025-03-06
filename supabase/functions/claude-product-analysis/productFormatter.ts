/**
 * Formats product data in a structured way for Claude's prompt
 */
export function formatProductsForPrompt(products: any[]): string {
  return products.map((product: any, productIndex: number) => {
    // Extract basic product info
    const { name, brand, price } = product;
    
    // Format basic product information block with product index for better reference
    const basicInfo = `PRODUCT #${productIndex + 1}
Product Name: ${name}
Brand: ${brand || 'Unknown'}
Price: $${price || 'Unknown'}
ID: ${product.id || 'Unknown'}`;

    // Enhanced description processing with segmentation for better readability
    let description = 'No description available';
    if (product.description && typeof product.description === 'string' && product.description.trim().length > 0) {
      // Clean up description to keep only meaningful text
      description = product.description
        .replace(/(\r\n|\n|\r)/gm, " ")  // Replace line breaks with spaces
        .replace(/\s+/g, " ")           // Replace multiple spaces with a single space
        .trim();
      
      // For long descriptions, add paragraph breaks every ~250 characters for readability
      if (description.length > 250) {
        const sentences = description.split(/(?<=[.!?])\s+/);
        let currentParagraph = "";
        const paragraphs = [];
        
        for (const sentence of sentences) {
          if ((currentParagraph + sentence).length > 250) {
            if (currentParagraph) paragraphs.push(currentParagraph);
            currentParagraph = sentence;
          } else {
            currentParagraph += (currentParagraph ? " " : "") + sentence;
          }
        }
        
        if (currentParagraph) paragraphs.push(currentParagraph);
        description = paragraphs.join("\n\n");
      }
    } else if (product.rawData?.description && typeof product.rawData.description === 'string' && product.rawData.description.trim().length > 0) {
      description = product.rawData.description
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      // Apply same paragraph formatting for readability
      if (description.length > 250) {
        const sentences = description.split(/(?<=[.!?])\s+/);
        let currentParagraph = "";
        const paragraphs = [];
        
        for (const sentence of sentences) {
          if ((currentParagraph + sentence).length > 250) {
            if (currentParagraph) paragraphs.push(currentParagraph);
            currentParagraph = sentence;
          } else {
            currentParagraph += (currentParagraph ? " " : "") + sentence;
          }
        }
        
        if (currentParagraph) paragraphs.push(currentParagraph);
        description = paragraphs.join("\n\n");
      }
    }

    // Collect all potential feature sources
    const allFeatureSources = [
      { source: 'feature_bullets_flat', data: product.rawData?.feature_bullets_flat },
      { source: 'features', data: product.features },
      { source: 'rich_product_description', data: product.rich_product_description }
    ];
    
    // Select the best features source based on availability and length
    let bestFeatureSource = null;
    let featuresArray = [];
    
    for (const source of allFeatureSources) {
      if (source.data && Array.isArray(source.data) && source.data.length > 0) {
        const validFeatures = source.data.filter(f => typeof f === 'string' && f.trim().length > 0);
        if (validFeatures.length > 0 && (!bestFeatureSource || validFeatures.length > featuresArray.length)) {
          bestFeatureSource = source.source;
          featuresArray = validFeatures;
        }
      }
    }
    
    // Format features with a clear header indicating the source
    let featureSection = '';
    if (featuresArray.length > 0) {
      featureSection = `KEY FEATURES (SOURCE: ${bestFeatureSource}):\n${featuresArray.map((feature, index) => `  ${index + 1}. ${feature}`).join('\n')}`;
    } else {
      // Check if we can extract features from specifications
      const extractedFeatures = [];
      
      if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
        for (const specGroup of product.rawData.specifications) {
          if (specGroup.name && specGroup.name.toLowerCase().includes('feature')) {
            if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
              for (const spec of specGroup.specifications) {
                if (spec.name && spec.value) {
                  extractedFeatures.push(`${spec.name}: ${spec.value}`);
                }
              }
            }
          }
        }
      }
      
      if (extractedFeatures.length > 0) {
        featureSection = `KEY FEATURES (EXTRACTED FROM SPECIFICATIONS):\n${extractedFeatures.map((feature, index) => `  ${index + 1}. ${feature}`).join('\n')}`;
      } else {
        // Enhanced fallback for products without explicit features
        featureSection = `KEY FEATURES: Unable to extract specific features. Please infer them from the description and specifications.`;
      }
    }

    // Create a comprehensive technical specifications collection
    const specsMap = new Map();
    
    // Add a helper function to add specs with source tracking
    const addSpecWithSource = (key: string, value: any, source: string) => {
      if (value === null || value === undefined || value === '') return;
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      specsMap.set(key, { value: valueStr, source });
    };
    
    // First add key technical specs with highest priority (they're already processed)
    if (product.keyTechSpecs && typeof product.keyTechSpecs === 'object') {
      Object.entries(product.keyTechSpecs).forEach(([key, value]) => {
        addSpecWithSource(`KEY - ${key}`, value, 'KEY_TECH_SPECS');
      });
    }
    
    // Then add from specifications_flat (medium priority)
    if (product.rawData?.specifications_flat && typeof product.rawData.specifications_flat === 'object') {
      Object.entries(product.rawData.specifications_flat).forEach(([key, value]) => {
        if (!specsMap.has(key)) { // Don't override key tech specs
          addSpecWithSource(key, value, 'SPECIFICATIONS_FLAT');
        }
      });
    }
    
    // Then add from product.specs (medium priority)
    if (product.specs && typeof product.specs === 'object') {
      Object.entries(product.specs).forEach(([key, value]) => {
        if (!specsMap.has(key)) { // Don't override higher priority specs
          addSpecWithSource(key, value, 'SPECS');
        }
      });
    }
    
    // Then add from structured specifications (lowest priority, but with hierarchy)
    if (product.rawData?.specifications && Array.isArray(product.rawData.specifications)) {
      for (const specGroup of product.rawData.specifications) {
        const groupName = specGroup.name || '';
        
        if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
          for (const spec of specGroup.specifications) {
            if (spec.name && spec.value) {
              // Include the group name for better context
              const fullSpecName = groupName ? `${groupName} - ${spec.name}` : spec.name;
              if (!specsMap.has(fullSpecName)) {
                addSpecWithSource(fullSpecName, spec.value, 'STRUCTURED_SPECIFICATIONS');
              }
            }
          }
        }
      }
    }
    
    // Organize specs into categories with clear separation
    const specCategories = {
      'KEY SPECIFICATIONS': [],
      'Processor & Performance': [],
      'Memory & Storage': [],
      'Display & Graphics': [],
      'Battery & Power': [],
      'Camera': [],
      'Audio': [],
      'Connectivity': [],
      'Physical Specifications': [],
      'Software': [],
      'Other': []
    };
    
    // Categorization function
    const categorizeSpec = (key: string, specInfo: any) => {
      const lowerKey = key.toLowerCase();
      
      // First check for key specifications
      if (lowerKey.includes('key -')) {
        return 'KEY SPECIFICATIONS';
      }
      
      // Check processor related
      if (lowerKey.includes('processor') || lowerKey.includes('cpu') || 
          lowerKey.includes('chip') || lowerKey.includes('cores') ||
          lowerKey.includes('clock') || lowerKey.includes('ghz')) {
        return 'Processor & Performance';
      }
      
      // Check memory and storage
      if (lowerKey.includes('memory') || lowerKey.includes('ram') || 
          lowerKey.includes('storage') || lowerKey.includes('disk') || 
          lowerKey.includes('drive') || lowerKey.includes('ssd') || 
          lowerKey.includes('hdd')) {
        return 'Memory & Storage';
      }
      
      // Check display related
      if (lowerKey.includes('display') || lowerKey.includes('screen') || 
          lowerKey.includes('resolution') || lowerKey.includes('ppi') || 
          lowerKey.includes('refresh') || lowerKey.includes('nits') ||
          lowerKey.includes('lcd') || lowerKey.includes('oled')) {
        return 'Display & Graphics';
      }
      
      // Check battery related
      if (lowerKey.includes('battery') || lowerKey.includes('power') || 
          lowerKey.includes('charging') || lowerKey.includes('mah')) {
        return 'Battery & Power';
      }
      
      // Check camera related
      if (lowerKey.includes('camera') || lowerKey.includes('lens') || 
          lowerKey.includes('megapixel') || lowerKey.includes('mp') || 
          lowerKey.includes('aperture') || lowerKey.includes('photo')) {
        return 'Camera';
      }
      
      // Check audio related
      if (lowerKey.includes('audio') || lowerKey.includes('sound') || 
          lowerKey.includes('speaker') || lowerKey.includes('microphone')) {
        return 'Audio';
      }
      
      // Check connectivity
      if (lowerKey.includes('wifi') || lowerKey.includes('bluetooth') || 
          lowerKey.includes('usb') || lowerKey.includes('port') || 
          lowerKey.includes('nfc') || lowerKey.includes('connectivity') ||
          lowerKey.includes('network') || lowerKey.includes('cellular')) {
        return 'Connectivity';
      }
      
      // Check physical specs
      if (lowerKey.includes('dimension') || lowerKey.includes('weight') || 
          lowerKey.includes('size') || lowerKey.includes('height') || 
          lowerKey.includes('width') || lowerKey.includes('depth') ||
          lowerKey.includes('material')) {
        return 'Physical Specifications';
      }
      
      // Check software related
      if (lowerKey.includes('os') || lowerKey.includes('operating system') || 
          lowerKey.includes('software') || lowerKey.includes('android') || 
          lowerKey.includes('ios') || lowerKey.includes('windows')) {
        return 'Software';
      }
      
      // Default category
      return 'Other';
    };
    
    // Categorize all specs
    specsMap.forEach((specInfo, key) => {
      const category = categorizeSpec(key, specInfo);
      specCategories[category].push({ key, ...specInfo });
    });
    
    // Build the specifications section with clear structure, formatting and source annotation
    let specsSection = '';
    if (specsMap.size > 0) {
      specsSection = 'TECHNICAL SPECIFICATIONS:\n';
      
      // Process each category in order (ensure KEY SPECIFICATIONS are first)
      const categoryOrder = Object.keys(specCategories);
      
      for (const category of categoryOrder) {
        const specs = specCategories[category];
        if (specs.length === 0) continue;
        
        specsSection += `  ${category}:\n`;
        
        // Sort specs within each category - key specs first, then alphabetically
        specs.sort((a, b) => {
          // KEY prefixed specs come first
          if (a.key.startsWith('KEY') && !b.key.startsWith('KEY')) return -1;
          if (!a.key.startsWith('KEY') && b.key.startsWith('KEY')) return 1;
          // Otherwise sort alphabetically
          return a.key.localeCompare(b.key);
        });
        
        // Format each spec with its source in parentheses
        specs.forEach(spec => {
          specsSection += `    ${spec.key}: ${spec.value} (Source: ${spec.source})\n`;
        });
        
        specsSection += '\n';
      }
    } else {
      specsSection = 'TECHNICAL SPECIFICATIONS: No detailed specifications available.\n';
    }

    // Add enhanced data quality metrics for better context
    const missingDataFields = [];
    if (!product.description || product.description.length < 50) missingDataFields.push('Detailed description');
    if (featuresArray.length < 3) missingDataFields.push('Complete feature list');
    if (specsMap.size < 5) missingDataFields.push('Comprehensive specifications');
    if (!product.keyTechSpecs?.processor) missingDataFields.push('Processor information');
    if (!product.keyTechSpecs?.memory) missingDataFields.push('Memory information');
    if (!product.keyTechSpecs?.storage) missingDataFields.push('Storage information');
    if (!product.keyTechSpecs?.display) missingDataFields.push('Display information');
    
    const dataQualityScore = product.meta?.data_quality_score || 0;
    const dataCompletenessRating = dataQualityScore >= 8 ? 'HIGH' : dataQualityScore >= 5 ? 'MEDIUM' : 'LOW';
    
    const dataQualitySection = `
DATA QUALITY ASSESSMENT:
  Overall Completeness Rating: ${dataCompletenessRating}
  Description Quality: ${description.length > 200 ? 'GOOD' : description.length > 50 ? 'FAIR' : 'POOR'}
  Features Available: ${featuresArray.length} items
  Specifications Available: ${specsMap.size} items
  Data Quality Score: ${dataQualityScore}/10
  Missing Key Data: ${missingDataFields.length > 0 ? missingDataFields.join(', ') : 'None'}
`;

    // Finally, combine all sections with clear dividers for better readability
    return `${basicInfo}

${'-'.repeat(50)}

PRODUCT DESCRIPTION:
${description}

${'-'.repeat(50)}

${featureSection}

${'-'.repeat(50)}

${specsSection}
${'-'.repeat(50)}
${dataQualitySection}`;
  }).join('\n\n' + '='.repeat(100) + '\n\n');
}