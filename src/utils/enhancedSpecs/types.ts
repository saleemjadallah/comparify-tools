
/**
 * Type definitions for the enhanced specification processing system
 */

// Type for the enhanced specs structure
export interface EnhancedSpecs {
  [category: string]: {
    [name: string]: string;
  };
}

// Type for the category mapping structure
export interface CategoryMapping {
  [keyword: string]: string;
}

// Normalizer function type
export type NormalizerFunction = (value: string) => string;

// Normalizers collection type
export interface Normalizers {
  [key: string]: NormalizerFunction;
}
