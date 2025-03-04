
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from "@/integrations/supabase/client";
import { analyzeProducts } from "../analyzeProducts";
import { validateProductCount, validateFeatures } from "../validation";
import { prepareProductData } from "../productDataPrep";
import { checkDataQuality, validateAndCompleteAnalysisData } from "../dataQualityCheck";
import { handleClaudeError, handleEmptyResponse, handleUnexpectedError } from "../errorHandling";
import { logger } from "../logging";
import { ServiceConnectionError, ResponseParsingError, DataQualityError } from "../errors";
import { toast } from "@/components/ui/use-toast";

// Mock external dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock("../validation", () => ({
  validateProductCount: vi.fn(),
  validateFeatures: vi.fn(),
}));

vi.mock("../productDataPrep", () => ({
  prepareProductData: vi.fn(),
}));

vi.mock("../dataQualityCheck", () => ({
  checkDataQuality: vi.fn(),
  validateAndCompleteAnalysisData: vi.fn(),
}));

vi.mock("../errorHandling", () => ({
  handleClaudeError: vi.fn(),
  handleEmptyResponse: vi.fn(),
  handleUnexpectedError: vi.fn(),
}));

vi.mock("../logging", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  logAnalysisStart: vi.fn(),
  logAnalysisCompletion: vi.fn(),
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe('analyzeProducts', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', price: 100, specs: { weight: '1kg' } },
    { id: '2', name: 'Product 2', price: 200, specs: { weight: '2kg' } },
  ];
  const mockFeatures = ['weight', 'price'];
  const mockCategory = 'electronics';
  const mockPreparedProducts = [
    { id: '1', name: 'Product 1', price: 100, specs: { weight: '1kg' }, brand: 'Brand A' },
    { id: '2', name: 'Product 2', price: 200, specs: { weight: '2kg' }, brand: 'Brand B' },
  ];
  const mockAnalysisResponse = {
    products: [
      {
        name: 'Product 1',
        overview: 'A great product',
        pros: ['light', 'cheap'],
        cons: ['less features'],
        featureRatings: {
          weight: { rating: 8, explanation: 'Very light' },
          price: { rating: 9, explanation: 'Very affordable' },
        },
      },
      {
        name: 'Product 2',
        overview: 'A premium product',
        pros: ['durable', 'feature-rich'],
        cons: ['expensive', 'heavy'],
        featureRatings: {
          weight: { rating: 6, explanation: 'Somewhat heavy' },
          price: { rating: 5, explanation: 'Premium pricing' },
        },
      },
    ],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Default mock implementations for successful flow
    (validateProductCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (validateFeatures as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (prepareProductData as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockPreparedProducts);
    (checkDataQuality as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ dataQualityIssues: false, dataQualityWarnings: [], missingFeaturesCount: { total: 0, byProduct: {} } });
    (supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockAnalysisResponse, error: null });
    (validateAndCompleteAnalysisData as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAnalysisResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully analyze products', async () => {
    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(validateProductCount).toHaveBeenCalledWith(mockProducts);
    expect(validateFeatures).toHaveBeenCalledWith(mockFeatures);
    expect(prepareProductData).toHaveBeenCalledWith(mockProducts);
    expect(checkDataQuality).toHaveBeenCalledWith(mockPreparedProducts);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('claude-product-analysis', {
      body: JSON.stringify({
        products: mockPreparedProducts,
        features: mockFeatures,
        category: mockCategory,
      }),
    });
    expect(validateAndCompleteAnalysisData).toHaveBeenCalledWith(mockAnalysisResponse, mockFeatures);
    expect(result).toEqual(mockAnalysisResponse);
  });

  it('should return null if product validation fails', async () => {
    // Arrange
    (validateProductCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(validateProductCount).toHaveBeenCalledWith(mockProducts);
    expect(result).toBeNull();
    // Ensure subsequent steps were not called
    expect(prepareProductData).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('should return null if feature validation fails', async () => {
    // Arrange
    (validateFeatures as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(validateFeatures).toHaveBeenCalledWith(mockFeatures);
    expect(result).toBeNull();
    // Ensure subsequent steps were not called
    expect(prepareProductData).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('should return null if data quality check fails', async () => {
    // Arrange
    (checkDataQuality as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new DataQualityError('Data quality issues', ['Missing descriptions']);
    });

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(checkDataQuality).toHaveBeenCalledWith(mockPreparedProducts);
    expect(logger.error).toHaveBeenCalled();
    expect(result).toBeNull();
    // Ensure subsequent steps were not called
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('should handle Claude API errors', async () => {
    // Arrange
    const apiError = { message: 'API error', status: 500 };
    (supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: apiError });
    (handleClaudeError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(supabase.functions.invoke).toHaveBeenCalled();
    expect(handleClaudeError).toHaveBeenCalledWith(apiError);
    expect(result).toBeNull();
  });

  it('should handle empty Claude response', async () => {
    // Arrange
    (supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
    (handleEmptyResponse as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(supabase.functions.invoke).toHaveBeenCalled();
    expect(handleEmptyResponse).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle response validation errors', async () => {
    // Arrange
    (validateAndCompleteAnalysisData as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new ResponseParsingError('Invalid response format');
    });

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(validateAndCompleteAnalysisData).toHaveBeenCalledWith(mockAnalysisResponse, mockFeatures);
    expect(result).toBeNull();
  });

  it('should handle unexpected errors', async () => {
    // Arrange
    (supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    (handleUnexpectedError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);

    // Act
    const result = await analyzeProducts(mockProducts, mockFeatures, mockCategory);

    // Assert
    expect(handleUnexpectedError).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
