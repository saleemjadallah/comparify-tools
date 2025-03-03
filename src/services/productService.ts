
// This file re-exports all product and comparison related services
// for backward compatibility

export type { ProductSearchResult } from './types';
export { searchProducts, searchProductsFromDatabase, searchProductsFromMock } from './productSearchService';
export { saveProduct } from './productManagementService';
export { saveComparison, getComparison } from './comparisonService';
