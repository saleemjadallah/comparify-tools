
export const useFeatureOperations = (
  featureImportance: string[],
  setFeatureImportance: React.Dispatch<React.SetStateAction<string[]>>
) => {
  // Toggle feature importance
  const toggleFeature = (feature: string) => {
    setFeatureImportance(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return { toggleFeature };
};
