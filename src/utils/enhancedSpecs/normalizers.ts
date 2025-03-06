
import { Normalizers } from './types';

/**
 * Collection of normalization functions for different types of specifications
 */
export const normalizers: Normalizers = {
  // Normalize storage values to GB
  normalizeStorage: (value: string): string => {
    const val = value.toLowerCase();
    if (val.includes('tb')) {
      return parseFloat(val) * 1024 + ' GB';
    } else if (val.includes('mb')) {
      return (parseFloat(val) / 1024).toFixed(2) + ' GB';
    } else if (val.includes('kb')) {
      return (parseFloat(val) / (1024 * 1024)).toFixed(4) + ' GB';
    }
    return value;
  },
  
  // Normalize display resolution
  normalizeResolution: (value: string): string => {
    // Convert common marketing terms to actual resolutions
    const resolutionMap: Record<string, string> = {
      'hd': '1280 x 720',
      'full hd': '1920 x 1080',
      'fhd': '1920 x 1080',
      '2k': '2560 x 1440',
      'qhd': '2560 x 1440',
      '4k': '3840 x 2160',
      'uhd': '3840 x 2160',
      '8k': '7680 x 4320'
    };
    
    const lowerValue = value.toLowerCase();
    for (const [term, resolution] of Object.entries(resolutionMap)) {
      if (lowerValue.includes(term)) {
        return `${value} (${resolution})`;
      }
    }
    return value;
  },
  
  // Normalize weight to grams or kilograms
  normalizeWeight: (value: string): string => {
    const val = value.toLowerCase();
    if (val.includes('pound') || val.includes('lb')) {
      const pounds = parseFloat(val);
      return `${pounds} lb (${(pounds * 453.592).toFixed(0)} g)`;
    } else if (val.includes('oz') || val.includes('ounce')) {
      const ounces = parseFloat(val);
      return `${ounces} oz (${(ounces * 28.35).toFixed(0)} g)`;
    }
    return value;
  },
  
  // Normalize RAM to GB
  normalizeRAM: (value: string): string => {
    const val = value.toLowerCase();
    if (val.includes('mb')) {
      return (parseFloat(val) / 1024).toFixed(2) + ' GB';
    } else if (!val.includes('gb') && !isNaN(parseFloat(val))) {
      return parseFloat(val) + ' GB';
    }
    return value;
  }
};
