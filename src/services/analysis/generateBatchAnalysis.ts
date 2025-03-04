
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
    // Generate the analysis
    const analysis = generateBatchComparisonAnalysis(products, category);
    
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
