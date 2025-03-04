
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { handleClaudeError, handleEmptyResponse, handleUnexpectedError } from "../errorHandling";
import { ServiceConnectionError, ResponseParsingError, TimeoutError } from "../errors";
import { logger } from "../logging";
import { toast } from "@/components/ui/use-toast";

// Mock dependencies
vi.mock("../logging", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe('errorHandling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('handleClaudeError', () => {
    it('should handle non-2xx status code errors', () => {
      // Arrange
      const error = { message: 'non-2xx status code: 500', status: 500 };

      // Act
      const result = handleClaudeError(error);

      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('Service Unavailable'),
        variant: 'destructive'
      }));
    });

    it('should handle network errors', () => {
      // Arrange
      const error = { message: 'Failed to fetch' };

      // Act
      const result = handleClaudeError(error);

      // Assert
      expect(result).toBeNull();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        description: expect.stringContaining('internet connection'),
        variant: 'destructive'
      }));
    });

    it('should handle timeout errors', () => {
      // Arrange
      const error = { message: 'timeout exceeded' };

      // Act
      const result = handleClaudeError(error);

      // Assert
      expect(result).toBeNull();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('Request Timeout'),
        variant: 'destructive'
      }));
    });

    it('should handle quota exceeded errors', () => {
      // Arrange
      const error = { message: 'quota exceeded' };

      // Act
      const result = handleClaudeError(error);

      // Assert
      expect(result).toBeNull();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        description: expect.stringContaining('usage limit'),
        variant: 'destructive'
      }));
    });

    it('should handle generic errors', () => {
      // Arrange
      const error = { message: 'Unknown error' };

      // Act
      const result = handleClaudeError(error);

      // Assert
      expect(result).toBeNull();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('Service Unavailable'),
        variant: 'destructive'
      }));
    });
  });

  describe('handleEmptyResponse', () => {
    it('should handle empty responses', () => {
      // Act
      const result = handleEmptyResponse();

      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('Response Error'),
        variant: 'destructive'
      }));
    });
  });

  describe('handleUnexpectedError', () => {
    it('should handle Error objects', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      const result = handleUnexpectedError(error);

      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error'),
        error,
        expect.objectContaining({ errorStack: expect.any(String) })
      );
      expect(toast).toHaveBeenCalled();
    });

    it('should handle string errors', () => {
      // Arrange
      const error = 'String error';

      // Act
      const result = handleUnexpectedError(error);

      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalled();
    });

    it('should handle unknown error types', () => {
      // Arrange
      const error = { custom: 'error object' };

      // Act
      const result = handleUnexpectedError(error);

      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalled();
    });
  });
});
