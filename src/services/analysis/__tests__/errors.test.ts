
import { describe, it, expect } from 'vitest';
import { 
  AnalysisError, 
  ValidationError, 
  DataQualityError, 
  ServiceConnectionError, 
  ResponseParsingError, 
  TimeoutError,
  getUserFriendlyErrorMessage
} from "../errors";

describe('error types', () => {
  describe('AnalysisError', () => {
    it('should create a base error with correct name', () => {
      // Act
      const error = new AnalysisError('Base error');

      // Assert
      expect(error.name).toBe('AnalysisError');
      expect(error.message).toBe('Base error');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with correct name', () => {
      // Act
      const error = new ValidationError('Invalid input');

      // Assert
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error instanceof AnalysisError).toBe(true);
    });
  });

  describe('DataQualityError', () => {
    it('should create a data quality error with issues', () => {
      // Act
      const issues = ['Missing data', 'Invalid format'];
      const error = new DataQualityError('Poor data quality', issues);

      // Assert
      expect(error.name).toBe('DataQualityError');
      expect(error.message).toBe('Poor data quality');
      expect(error.dataIssues).toEqual(issues);
      expect(error instanceof AnalysisError).toBe(true);
    });

    it('should handle empty issues array', () => {
      // Act
      const error = new DataQualityError('Poor data quality');

      // Assert
      expect(error.dataIssues).toEqual([]);
    });
  });

  describe('ServiceConnectionError', () => {
    it('should create a service connection error with service name and status code', () => {
      // Act
      const error = new ServiceConnectionError('API unavailable', 'ClaudeAPI', 500);

      // Assert
      expect(error.name).toBe('ServiceConnectionError');
      expect(error.message).toBe('API unavailable');
      expect(error.serviceName).toBe('ClaudeAPI');
      expect(error.statusCode).toBe(500);
      expect(error instanceof AnalysisError).toBe(true);
    });

    it('should handle missing status code', () => {
      // Act
      const error = new ServiceConnectionError('API unavailable', 'ClaudeAPI');

      // Assert
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('ResponseParsingError', () => {
    it('should create a response parsing error with correct name', () => {
      // Act
      const error = new ResponseParsingError('Invalid JSON');

      // Assert
      expect(error.name).toBe('ResponseParsingError');
      expect(error.message).toBe('Invalid JSON');
      expect(error instanceof AnalysisError).toBe(true);
    });
  });

  describe('TimeoutError', () => {
    it('should create a timeout error with default message', () => {
      // Act
      const error = new TimeoutError();

      // Assert
      expect(error.name).toBe('TimeoutError');
      expect(error.message).toBe('Operation timed out');
      expect(error instanceof AnalysisError).toBe(true);
    });

    it('should create a timeout error with custom message', () => {
      // Act
      const error = new TimeoutError('Custom timeout message');

      // Assert
      expect(error.message).toBe('Custom timeout message');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should format validation errors', () => {
      // Arrange
      const error = new ValidationError('Invalid input');

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result).toEqual({
        title: 'Validation Error',
        description: 'Invalid input',
        variant: 'destructive'
      });
    });

    it('should format data quality errors with issues', () => {
      // Arrange
      const error = new DataQualityError('Poor data quality', ['Issue 1', 'Issue 2']);

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result).toEqual({
        title: 'Data Quality Issue',
        description: 'Poor data quality Issues: Issue 1, Issue 2',
        variant: 'destructive'
      });
    });

    it('should format service connection errors', () => {
      // Arrange
      const error = new ServiceConnectionError('API unavailable', 'ClaudeAPI');

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result).toEqual({
        title: 'Service Unavailable: ClaudeAPI',
        description: 'API unavailable',
        variant: 'destructive'
      });
    });

    it('should format response parsing errors', () => {
      // Arrange
      const error = new ResponseParsingError('Invalid JSON');

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result.title).toBe('Response Error');
      expect(result.variant).toBe('destructive');
    });

    it('should format timeout errors', () => {
      // Arrange
      const error = new TimeoutError();

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result.title).toBe('Request Timeout');
      expect(result.variant).toBe('destructive');
    });

    it('should format generic errors', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act
      const result = getUserFriendlyErrorMessage(error);

      // Assert
      expect(result).toEqual({
        title: 'Analysis Error',
        description: 'Generic error',
        variant: 'destructive'
      });
    });
  });
});
