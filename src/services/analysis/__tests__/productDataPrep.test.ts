
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { prepareProductData } from "../productDataPrep";
import { logger } from "../logging";

// Mock dependencies
vi.mock("../logging", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => '12345678-1234-1234-1234-123456789012'
});

describe('productDataPrep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('prepareProductData', () => {
    it('should prepare product data with all fields', () => {
      // Arrange
      const products = [
        {
          id: '1',
          name: 'Product 1',
          brand: 'Brand A',
          price: 100,
          specs: { weight: '1kg' },
          description: 'A great product',
          features: ['Light', 'Affordable'],
          rich_product_description: ['This product is amazing']
        }
      ];

      // Act
      const result = prepareProductData(products);

      // Assert
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Product 1',
        brand: 'Brand A',
        price: 100,
        specs: { weight: '1kg' },
        description: 'A great product',
        features: ['Light', 'Affordable'],
        rich_product_description: ['This product is amazing'],
        rawData: expect.objectContaining({
          description: 'A great product',
          feature_bullets_flat: ['Light', 'Affordable'],
          specifications_flat: { weight: '1kg' }
        })
      });
      expect(logger.info).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should handle missing fields and provide defaults', () => {
      // Arrange
      const products = [
        {
          name: 'Minimal Product',
          // Missing many fields
        }
      ];

      // Act
      const result = prepareProductData(products);

      // Assert
      expect(result[0]).toMatchObject({
        name: 'Minimal Product',
        brand: 'Unknown',
        price: 'Unknown',
        specs: {},
        id: '12345678-1234-1234-1234-123456789012', // From mocked randomUUID
        description: '',
        features: [],
        rich_product_description: [],
      });
      expect(logger.warn).toHaveBeenCalledTimes(3); // No description, features, and specs
    });

    it('should handle deeply nested specs', () => {
      // Arrange
      const products = [
        {
          name: 'Nested Product',
          details: {
            specs: {
              weight: '500g',
              dimensions: '10x5x2'
            }
          }
        }
      ];

      // Act
      const result = prepareProductData(products);

      // Assert
      expect(result[0].specs).toEqual({
        weight: '500g',
        dimensions: '10x5x2'
      });
    });
  });
});
