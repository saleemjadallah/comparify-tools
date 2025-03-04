
import React from 'react';
import { truncateText } from './utils/featureUtils';

interface FeatureRatingHeaderProps {
  feature: string;
}

const FeatureRatingHeader = ({ feature }: FeatureRatingHeaderProps) => {
  return (
    <div className="bg-secondary py-3 px-6 border-b">
      <h3 className="font-semibold">{feature}</h3>
    </div>
  );
};

export default FeatureRatingHeader;
