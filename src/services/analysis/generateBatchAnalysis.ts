
import { supabase } from "@/integrations/supabase/client";
import { BatchComparisonAnalysis } from "./comparisonAnalysisTypes";
import { generateBatchComparisonAnalysis } from "./batchComparisonService";
import { ProductSearchResult } from "../types";
import { Json } from "@/integrations/supabase/types";

/**
 * Generates and saves a batch comparison analysis
 */
export const generateAndSaveBatchAnalysis = async (
  products: ProductSearchResult[],
  category: string,
  comparisonId: string
): Promise<BatchComparisonAnalysis | null> => {
  try {
    console.log('Starting batch analysis generation for:', category);
    
    // Add truncated product names for logging
    const truncateText = (text: string, maxLength: number = 15) => {
      if (!text) return "";
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };
    
    console.log('Products to analyze:', products.map(p => truncateText(p.name)));
    
    // Log sample product data to see what's available
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('Sample product data:', {
        id: sampleProduct.id,
        name: truncateText(sampleProduct.name),
        features: sampleProduct.features,
        specs: sampleProduct.specs ? Object.keys(sampleProduct.specs) : 'No specs',
        enhancedSpecs: sampleProduct.enhancedSpecs ? Object.keys(sampleProduct.enhancedSpecs) : 'No enhanced specs',
        description: sampleProduct.description ? sampleProduct.description.substring(0, 100) + '...' : 'No description'
      });
    }
    
    // Generate the analysis
    const analysis = generateBatchComparisonAnalysis(products, category);
    
    // Log feature matrix data for debugging
    if (analysis && analysis.featureMatrix) {
      console.log('Generated feature matrix data:');
      console.log(`Total features found: ${analysis.featureMatrix.features.length}`);
      
      // Log the first few features and their presence data
      const sampleFeatures = analysis.featureMatrix.features.slice(0, 3);
      console.log('Sample features:', sampleFeatures.map(f => ({
        name: f.featureName,
        isStandard: f.isStandard,
        isPremium: f.isPremium,
        isUnique: f.isUnique,
        presenceData: Object.entries(f.presence).map(([id, data]) => ({
          productId: id,
          productName: truncateText(products.find(p => p.id === id)?.name || 'Unknown'),
          present: data.present,
          rating: data.qualityRating
        }))
      })));
    } else {
      console.log('No feature matrix generated');
    }
    
    // Add metadata
    analysis.id = comparisonId;
    analysis.createdAt = new Date().toISOString();
    
    // Save to database (if available)
    const { error } = await supabase
      .from('comparison_analyses')
      .upsert({
        comparison_id: comparisonId,
        analysis_data: analysis as unknown as Json, // Cast to Json type for Supabase
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving batch analysis:', error);
    } else {
      console.log('Successfully saved batch analysis to database');
    }
    
    return analysis;
  } catch (error) {
    console.error('Error generating batch analysis:', error);
    return null;
  }
};

/**
 * Retrieves a saved batch comparison analysis
 */
export const getBatchAnalysis = async (
  comparisonId: string
): Promise<BatchComparisonAnalysis | null> => {
  try {
    const { data, error } = await supabase
      .from('comparison_analyses')
      .select('analysis_data')
      .eq('comparison_id', comparisonId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching batch analysis:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Cast the data to BatchComparisonAnalysis type with proper type assertion
    return data.analysis_data as unknown as BatchComparisonAnalysis;
  } catch (error) {
    console.error('Error retrieving batch analysis:', error);
    return null;
  }
};
