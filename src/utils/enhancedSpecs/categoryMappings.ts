
import { CategoryMapping } from './types';

/**
 * Map of known specification categories
 */
export const categoryMappings: CategoryMapping = {
  // Display related
  'display': 'display',
  'screen': 'display',
  'resolution': 'display',
  'refresh rate': 'display',
  
  // Battery related
  'battery': 'battery',
  'charging': 'battery',
  'runtime': 'battery',
  
  // Physical attributes
  'dimensions': 'physical',
  'weight': 'physical',
  'material': 'physical',
  'color': 'physical',
  
  // Performance
  'processor': 'performance',
  'cpu': 'performance',
  'gpu': 'performance',
  'ram': 'performance',
  'memory': 'performance',
  'benchmark': 'performance',
  
  // Storage
  'storage': 'storage',
  'hard drive': 'storage',
  'ssd': 'storage',
  'capacity': 'storage',
  
  // Camera
  'camera': 'camera',
  'lens': 'camera',
  'megapixel': 'camera',
  'photo': 'camera',
  'video': 'camera',
  
  // Connectivity
  'wifi': 'connectivity',
  'bluetooth': 'connectivity',
  'usb': 'connectivity',
  'port': 'connectivity',
  'connection': 'connectivity',
  
  // Audio
  'audio': 'audio',
  'sound': 'audio',
  'speaker': 'audio',
  'microphone': 'audio',
  
  // General
  'model': 'general',
  'brand': 'general',
  'type': 'general',
  'year': 'general',
  
  // Warranty
  'warranty': 'warranty',
  'guarantee': 'warranty',
  'support': 'warranty'
};
