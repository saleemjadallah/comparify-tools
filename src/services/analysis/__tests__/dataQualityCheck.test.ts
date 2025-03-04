
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { checkDataQuality, validateAndCompleteAnalysisData } from "../dataQualityCheck";
import { DataQualityError, ResponseParsingError } from "../errors";
import { logger } from "../logging";
import { toast } from "@/components/ui/use-toast";

// Mock dependencies
vi.mock("../logging", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe('dataQualityCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkDataQuality', () => {
    it('should pass for high-quality data', () => {
      // Arrange
      const productData = [
        {
          name: 'Good Product',
          description: 'This is a very detailed product description with plenty of information.',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          specs: { spec1: 'value1', spec2: 'value2', spec3: 'value3', spec4: 'value4' }
        }
      ];

      // Act
      const result = checkDataQuality(productData);

      // Assert
      expect(result.dataQualityIssues).toBe(false);
      expect(result.dataQualityWarnings).toEqual([]);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should warn but not throw error for partial quality issues', () => {
      // Arrange
      const productData = [
        {
          name: 'Good Product',
          description: 'Good description',
          features: ['Feature 1', 'Feature 2'],
          specs: { spec1: 'value1', spec2: 'value2', spec3: 'value3' }
        },
        {
          name: 'Bad Product',
          description: '',
          features: [],
          specs: { spec1: 'value1' }
        }
      ];

      // Act
      const result = checkDataQuality(productData);

      // Assert
      expect(result.dataQualityIssues).toBe(true);
      expect(result.dataQualityWarnings.length).toBe(1);
      expect(result.dataQualityWarnings[0]).toContain('Bad Product');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw DataQualityError when all products have serious issues', () => {
      // Arrange
      const productData = [
        {
          name: 'Bad Product 1',
          description: '',
          features: [],
          specs: {}
        },
        {
          name: 'Bad Product 2',
          description: '',
          features: [],
          specs: {}
        }
      ];

      // Act & Assert
      expect(() => checkDataQuality(productData)).toThrow(DataQualityError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('validateAndCompleteAnalysisData', () => {
    it('should validate complete analysis data', () => {
      // Arrange
      const features = ['weight', 'price'];
      const analysisData = {
        products: [
          {
            name: 'Product 1',
            overview: 'Overview 1',
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1'],
            featureRatings: {
              weight: { rating: 8, explanation: 'Good weight' },
              price: { rating: 7, explanation: 'Good price' }
            }
          }
        ]
      };

      // Act
      const result = validateAndCompleteAnalysisData(analysisData, features);

      // Assert
      expect(result).toEqual(analysisData);
      expect(toast).not.toHaveBeenCalled();
    });

    it('should throw error for invalid response format', () => {
      // Arrange
      const features = ['weight', 'price'];
      const invalidData = { someRandomField: 'value' };

      // Act & Assert
      expect(() => validateAndCompleteAnalysisData(invalidData as any, features))
        .toThrow(ResponseParsingError);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should fill in missing feature ratings', () => {
      // Arrange
      const features = ['weight', 'price', 'durability'];
      const incompleteData = {
        products: [
          {
            name: 'Product 1',
            overview: 'Overview 1',
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1'],
            featureRatings: {
              weight: { rating: 8, explanation: 'Good weight' }
              // Missing price and durability ratings
            }
          }
        ]
      };

      // Act
      const result = validateAndCompleteAnalysisData(incompleteData, features);

      // Assert
      expect(result.products[0].featureRatings.price).toBeDefined();
      expect(result.products[0].featureRatings.durability).toBeDefined();
      expect(logger.warn).toHaveBeenCalled();
      expect(toast).toHaveBeenCalled(); // Should show toast for significant missing data
    });

    it('should fill in missing required fields', () => {
      // Arrange
      const features = ['weight'];
      const incompleteData = {
        products: [
          {
            name: 'Product 1',
            // Missing overview, pros, cons, featureRatings
          }
        ]
      };

      // Act
      const result = validateAndCompleteAnalysisData(incompleteData, features);

      // Assert
      expect(result.products[0].overview).toBeDefined();
      expect(result.products[0].pros).toBeDefined();
      expect(result.products[0].cons).toBeDefined();
      expect(result.products[0].featureRatings).toBeDefined();
      expect(result.products[0].featureRatings.weight).toBeDefined();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
