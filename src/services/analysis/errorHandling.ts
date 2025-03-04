
import { toast } from "@/components/ui/use-toast";

/**
 * Handles errors from Claude analysis function call
 * Returns descriptive error messages based on error type
 */
export const handleClaudeError = (error: any): null => {
  console.error('Error calling Claude analysis function:', error);
  
  // Provide more detailed error messages based on error type
  let errorMessage = "Could not analyze products.";
  let errorDetail = "";
  
  if (error.message?.includes("non-2xx status code")) {
    errorMessage = "AI service unavailable";
    errorDetail = "The AI service is currently unavailable or overloaded. Your comparison will be created without AI analysis.";
  } else if (error.message?.includes("Failed to fetch")) {
    errorMessage = "Network error";
    errorDetail = "Could not connect to the AI service. Please check your internet connection and try again.";
  } else if (error.message?.includes("timeout")) {
    errorMessage = "Request timeout";
    errorDetail = "The AI analysis took too long to complete. Your comparison will be created without AI analysis.";
  } else if (error.message?.includes("quota")) {
    errorMessage = "Service quota exceeded";
    errorDetail = "The AI service usage limit has been reached. Your comparison will be created without AI analysis.";
  }
  
  toast({
    title: errorMessage,
    description: errorDetail || error.message,
    variant: "destructive",
  });
  return null;
};

/**
 * Handles empty or invalid response data
 */
export const handleEmptyResponse = (): null => {
  console.error('Empty response from Claude analysis function');
  toast({
    title: "Analysis Unavailable",
    description: "Received empty response from the AI service. Your comparison will be created without AI analysis.",
    variant: "destructive",
  });
  return null;
};

/**
 * Handles unexpected errors in the analysis process
 */
export const handleUnexpectedError = (error: unknown): null => {
  console.error('Unexpected error in analyzeProducts:', error);
  toast({
    title: "Analysis Error",
    description: error instanceof Error 
      ? `An unexpected error occurred: ${error.message}` 
      : "An unknown error occurred while analyzing the products. Your comparison will be created without AI analysis.",
    variant: "destructive",
  });
  return null;
};
