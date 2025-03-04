
// Helper functions for feature comparison

// Helper function to truncate text
export const truncateText = (text: string, maxLength: number = 15) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Helper function to normalize feature names for comparison
export const normalizeFeatureName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

// Helper function to get confidence level color
export const getConfidenceColor = (confidence?: string): string => {
  if (!confidence) return "bg-gray-200 text-gray-700";
  
  switch (confidence.toLowerCase()) {
    case "high":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-200 text-gray-700";
  }
};
