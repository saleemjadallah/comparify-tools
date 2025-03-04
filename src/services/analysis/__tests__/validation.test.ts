
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { validateProductCount, validateFeatures } from "../validation";
import { toast } from "@/components/ui/use-toast";
import { logger } from "../logging";

// Mock dependencies
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("../logging", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('validation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('validateProductCount', () => {
    it('should return true for valid product count', () => {
      // Arrange
      const products = [{ id: '1' }, { id: '2' }];

      // Act
      const result = validateProductCount(products);

      // Assert
      expect(result).toBe(true);
      expect(logger.debug).toHaveBeenCalled();
      expect(toast).not.toHaveBeenCalled();
    });

    it('should return false for insufficient products', () => {
      // Arrange
      const products = [{ id: '1' }];

      // Act
      const result = validateProductCount(products);

      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: "Analysis Error",
        description: "At least 2 products are required for comparison analysis.",
        variant: "destructive",
      });
    });

    it('should return false for null or empty products array', () => {
      // Act & Assert
      expect(validateProductCount([])).toBe(false);
      expect(validateProductCount(null as any)).toBe(false);
      expect(toast).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateFeatures', () => {
    it('should return true for valid features', () => {
      // Arrange
      const features = ['weight', 'price'];

      // Act
      const result = validateFeatures(features);

      // Assert
      expect(result).toBe(true);
      expect(logger.debug).toHaveBeenCalled();
      expect(toast).not.toHaveBeenCalled();
    });

    it('should return false for empty features array', () => {
      // Arrange
      const features: string[] = [];

      // Act
      const result = validateFeatures(features);

      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: "Analysis Error",
        description: "Please select at least one important feature for product comparison.",
        variant: "destructive",
      });
    });

    it('should return false for null features', () => {
      // Act
      const result = validateFeatures(null as any);

      // Assert
      expect(result).toBe(false);
      expect(toast).toHaveBeenCalled();
    });
  });
});
