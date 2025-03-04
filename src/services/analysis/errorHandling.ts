
import { toast } from "@/components/ui/use-toast";
import { 
  ServiceConnectionError, 
  ResponseParsingError, 
  TimeoutError,
  getUserFriendlyErrorMessage
} from "./errors";
import { logger } from "./logging";

/**
 * Handles errors from Claude analysis function call
 * Returns descriptive error messages based on error type
 */
export const handleClaudeError = (error: any): null => {
  // Create a more specific error based on the type of error encountered
  let specificError: Error;
  
  if (error.message?.includes("non-2xx status code")) {
    specificError = new ServiceConnectionError(
      "The AI service is currently unavailable or overloaded. Your comparison will be created without AI analysis.",
      "Claude API",
      error.status
    );
  } else if (error.message?.includes("Failed to fetch")) {
    specificError = new ServiceConnectionError(
      "Could not connect to the AI service. Please check your internet connection and try again.",
      "Claude API"
    );
  } else if (error.message?.includes("timeout")) {
    specificError = new TimeoutError(
      "The AI analysis took too long to complete. Your comparison will be created without AI analysis."
    );
  } else if (error.message?.includes("quota")) {
    specificError = new ServiceConnectionError(
      "The AI service usage limit has been reached. Your comparison will be created without AI analysis.",
      "Claude API"
    );
  } else {
    specificError = new ServiceConnectionError(
      error.message || "Could not analyze products.",
      "Claude API"
    );
  }
  
  // Log the error with contextual information
  logger.error(`Claude analysis error: ${specificError.message}`, error, {
    errorType: specificError.name,
    originalMessage: error.message
  });
  
  // Show user friendly toast
  const { title, description, variant } = getUserFriendlyErrorMessage(specificError);
  toast({ title, description, variant });
  
  return null;
};

/**
 * Handles empty or invalid response data
 */
export const handleEmptyResponse = (): null => {
  const error = new ResponseParsingError(
    "Received empty response from the AI service. Your comparison will be created without AI analysis."
  );
  
  logger.error('Empty response from Claude analysis function', error);
  
  const { title, description, variant } = getUserFriendlyErrorMessage(error);
  toast({ title, description, variant });
  
  return null;
};

/**
 * Handles unexpected errors in the analysis process
 */
export const handleUnexpectedError = (error: unknown): null => {
  // Convert to standard Error if it's not already
  const standardError = error instanceof Error 
    ? error 
    : new Error(typeof error === 'string' ? error : 'Unknown error');
  
  logger.error('Unexpected error in analyzeProducts', standardError, {
    errorStack: standardError.stack
  });
  
  // Show appropriate message to user
  const { title, description, variant } = getUserFriendlyErrorMessage(standardError);
  toast({ title, description, variant });
  
  return null;
};
