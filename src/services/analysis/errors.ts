
/**
 * Custom error types for product analysis
 * Enables more specific error handling and messaging
 */

// Base analysis error class
export class AnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Input validation errors
export class ValidationError extends AnalysisError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Product data quality errors
export class DataQualityError extends AnalysisError {
  public dataIssues: string[];
  
  constructor(message: string, dataIssues: string[] = []) {
    super(message);
    this.name = 'DataQualityError';
    this.dataIssues = dataIssues;
  }
}

// Service connection errors (API, Claude, etc)
export class ServiceConnectionError extends AnalysisError {
  public serviceName: string;
  public statusCode?: number;
  
  constructor(message: string, serviceName: string, statusCode?: number) {
    super(message);
    this.name = 'ServiceConnectionError';
    this.serviceName = serviceName;
    this.statusCode = statusCode;
  }
}

// Response parsing errors
export class ResponseParsingError extends AnalysisError {
  constructor(message: string) {
    super(message);
    this.name = 'ResponseParsingError';
  }
}

// Timeout errors
export class TimeoutError extends AnalysisError {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Get user-friendly error message based on error type
export const getUserFriendlyErrorMessage = (error: Error): {
  title: string;
  description: string;
  variant: "default" | "destructive";
} => {
  if (error instanceof ValidationError) {
    return {
      title: "Validation Error",
      description: error.message,
      variant: "destructive"
    };
  }
  
  if (error instanceof DataQualityError) {
    return {
      title: "Data Quality Issue",
      description: `${error.message}${error.dataIssues.length > 0 ? ' Issues: ' + error.dataIssues.join(', ') : ''}`,
      variant: "destructive"
    };
  }
  
  if (error instanceof ServiceConnectionError) {
    return {
      title: `Service Unavailable: ${error.serviceName}`,
      description: error.message,
      variant: "destructive"
    };
  }
  
  if (error instanceof ResponseParsingError) {
    return {
      title: "Response Error",
      description: "The AI service returned an invalid or unexpected response format. Your comparison will be created without AI analysis.",
      variant: "destructive"
    };
  }
  
  if (error instanceof TimeoutError) {
    return {
      title: "Request Timeout",
      description: "The AI analysis took too long to complete. Your comparison will be created without AI analysis.",
      variant: "destructive"
    };
  }
  
  return {
    title: "Analysis Error",
    description: error.message || "An unexpected error occurred during analysis. Your comparison will be created without AI analysis.",
    variant: "destructive"
  };
};
