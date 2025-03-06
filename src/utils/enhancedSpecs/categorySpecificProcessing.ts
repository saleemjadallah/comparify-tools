
import { EnhancedSpecs } from './types';

/**
 * Process smartphone-specific features and specifications
 */
export function processSmartphoneSpecifics(product: any, specs: EnhancedSpecs): void {
  // Extract camera information
  const description = product.description || '';
  
  // Look for MP camera information in description
  const mpRegex = /(\d+(?:\.\d+)?)\s*MP\s*(?:camera|shooter)/gi;
  const mpMatches = [...description.matchAll(mpRegex)];
  
  if (mpMatches.length > 0) {
    specs.camera['Main Camera'] = specs.camera['Main Camera'] || mpMatches[0][1] + ' MP';
    if (mpMatches.length > 1) {
      specs.camera['Secondary Camera'] = specs.camera['Secondary Camera'] || mpMatches[1][1] + ' MP';
    }
  }
  
  // Look for battery capacity
  const mAhRegex = /(\d+)\s*mAh/i;
  const mAhMatch = description.match(mAhRegex);
  
  if (mAhMatch) {
    specs.battery['Battery Capacity'] = specs.battery['Battery Capacity'] || mAhMatch[1] + ' mAh';
  }
  
  // Detect 5G capability
  if (description.includes('5G')) {
    specs.connectivity['5G Support'] = 'Yes';
  }
}

/**
 * Process laptop-specific features and specifications
 */
export function processLaptopSpecifics(product: any, specs: EnhancedSpecs): void {
  const description = product.description || '';
  
  // Look for GPU information
  const gpuRegex = /(nvidia|amd|intel)\s*(geforce|radeon|iris|uhd)?\s*(rtx|gtx|rx)?\s*(\d+)?/i;
  const gpuMatch = description.match(gpuRegex);
  
  if (gpuMatch) {
    specs.performance['Graphics'] = specs.performance['Graphics'] || gpuMatch[0];
  }
  
  // Check for SSD vs HDD
  if (description.toLowerCase().includes('ssd')) {
    specs.storage['Storage Type'] = specs.storage['Storage Type'] || 'SSD';
  } else if (description.toLowerCase().includes('hdd') || description.toLowerCase().includes('hard drive')) {
    specs.storage['Storage Type'] = specs.storage['Storage Type'] || 'HDD';
  }
  
  // Check for touchscreen
  if (description.toLowerCase().includes('touch screen') || description.toLowerCase().includes('touchscreen')) {
    specs.display['Touchscreen'] = 'Yes';
  }
}

/**
 * Process TV-specific features and specifications
 */
export function processTVSpecifics(product: any, specs: EnhancedSpecs): void {
  const description = product.description || '';
  
  // Check for HDR support
  if (description.match(/\bHDR\d*\b/i)) {
    specs.display['HDR Support'] = 'Yes';
  }
  
  // Check for smart TV capabilities
  if (description.toLowerCase().includes('smart tv')) {
    specs.features['Smart TV'] = 'Yes';
  }
  
  // Detect refresh rate
  const refreshRateRegex = /(\d+)Hz/i;
  const refreshMatch = description.match(refreshRateRegex);
  
  if (refreshMatch) {
    specs.display['Refresh Rate'] = specs.display['Refresh Rate'] || refreshMatch[1] + ' Hz';
  }
}
