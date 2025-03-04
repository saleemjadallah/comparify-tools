
import { supabase } from "@/integrations/supabase/client";
import { BatchComparisonAnalysis } from "./comparisonAnalysisTypes";
import { generateBatchComparisonAnalysis } from "./batchComparisonService";
import { ProductSearchResult } from "../types";

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
        analysis_data: analysis,
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
      .single();
    
    if (error) {
      console.error('Error fetching batch analysis:', error);
      return null;
    }
    
    return data?.analysis_data as BatchComparisonAnalysis;
  } catch (error) {
    console.error('Error retrieving batch analysis:', error);
    return null;
  }
};
