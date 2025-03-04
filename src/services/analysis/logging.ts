
/**
 * Centralized logging service for product analysis
 * Provides consistent logging patterns and levels
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry structure
interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

/**
 * Main logger function that handles different log levels
 */
export const logger = {
  debug: (message: string, context?: Record<string, any>) => {
    logMessage(LogLevel.DEBUG, message, context);
  },
  
  info: (message: string, context?: Record<string, any>) => {
    logMessage(LogLevel.INFO, message, context);
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    logMessage(LogLevel.WARN, message, context);
  },
  
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const errorContext = {
      ...(context || {}),
      errorName: error?.name,
      errorStack: error?.stack,
      errorMessage: error?.message
    };
    
    logMessage(LogLevel.ERROR, message, errorContext);
  }
};

/**
 * Format and output log entries
 */
function logMessage(level: LogLevel, message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString()
  };
  
  // Different formatting based on log level
  switch (level) {
    case LogLevel.ERROR:
      console.error(`${entry.timestamp} [${level}] ${message}`, context ? context : '');
      break;
    case LogLevel.WARN:
      console.warn(`${entry.timestamp} [${level}] ${message}`, context ? context : '');
      break;
    case LogLevel.INFO:
      console.log(`${entry.timestamp} [${level}] ${message}`, context ? context : '');
      break;
    case LogLevel.DEBUG:
      console.debug(`${entry.timestamp} [${level}] ${message}`, context ? context : '');
      break;
  }
}

/**
 * Logs the starting analysis information with consistent formatting
 */
export const logAnalysisStart = (products: any[], features: string[], category: string): void => {
  logger.info(`Starting analysis of ${products.length} products in category "${category}"`, {
    productNames: products.map(p => p.name),
    features,
    productCount: products.length
  });
};

/**
 * Logs a successful analysis completion
 */
export const logAnalysisCompletion = (productsAnalyzed: number, featuresAnalyzed: number, duration: number): void => {
  logger.info(`Analysis completed successfully`, {
    productsAnalyzed,
    featuresAnalyzed,
    durationMs: duration
  });
};
