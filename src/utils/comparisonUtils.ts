
// Helper function to get features based on category
export const getFeaturesByCategory = (category: string): string[] => {
  const commonFeatures = [
    "Price",
    "Value for Money",
    "Build Quality",
    "Design",
    "User Experience",
    "Customer Support",
    "Warranty",
  ];

  const categoryFeatures: Record<string, string[]> = {
    "Smartphones": [
      "Performance",
      "Battery Life",
      "Camera Quality",
      "Display",
      "Software",
      "Storage",
      "5G Connectivity",
    ],
    "Laptops": [
      "Performance",
      "Battery Life",
      "Display Quality",
      "Keyboard",
      "Portability",
      "Storage",
      "Connectivity",
    ],
    "Headphones": [
      "Sound Quality",
      "Noise Cancellation",
      "Battery Life",
      "Comfort",
      "Connectivity",
      "Durability",
      "Portability",
    ],
    "TVs": [
      "Picture Quality",
      "Sound Quality",
      "Smart Features",
      "Connectivity",
      "Screen Size",
      "Refresh Rate",
      "HDR Support",
    ],
    "Cameras": [
      "Image Quality",
      "Video Quality",
      "Autofocus",
      "Low Light Performance",
      "Battery Life",
      "Portability",
      "Durability",
    ],
    "Smartwatches": [
      "Battery Life",
      "Health Features",
      "Display",
      "Connectivity",
      "App Ecosystem",
      "Durability",
      "Water Resistance",
    ],
    "Gaming Consoles": [
      "Performance",
      "Game Library",
      "Online Services",
      "Controller",
      "Storage",
      "Multimedia Features",
      "Portability",
    ],
    "Smart Home Devices": [
      "Integration",
      "Voice Control",
      "Setup Ease",
      "Automation Features",
      "Privacy",
      "Connectivity",
      "App Quality",
    ],
    "Tablets": [
      "Performance",
      "Display",
      "Battery Life",
      "Portability",
      "Pen Support",
      "Storage",
      "App Ecosystem",
    ],
  };

  return category && categoryFeatures[category]
    ? [...categoryFeatures[category], ...commonFeatures]
    : commonFeatures;
};
