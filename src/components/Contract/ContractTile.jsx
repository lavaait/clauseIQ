import React from 'react';

const ContractTile = ({ stage, count, color, icon }) => {
  const isIncrease = Math.random() > 0.5;
  const trendValue = isIncrease ? 12 : 8;
  
  const getTextColor = () => {
    // Use dark text for light/bright backgrounds
    if (color === 'bg-occ-yellow' || color === 'bg-occ-secondary-orange') {
      return 'text-gray-900'; // Dark text for better contrast
    }
    // Use white text for dark backgrounds
    return 'text-white';
  };

  const getTrendTextColor = () => {
    // Use very dark text for light/bright backgrounds
    if (color === 'bg-occ-yellow' || color === 'bg-occ-secondary-orange') {
      return 'text-gray-800'; // Darker than before for better contrast
    }
    // Use light gray for dark backgrounds instead of white/80
    return 'text-gray-200';
  };

  const getTrendLabel = () => {
    return isIncrease ? 'Increase' : 'Decrease';
  };

  const getBackgroundWithBorder = () => {
    // Add subtle border for better definition on light backgrounds
    if (color === 'bg-occ-yellow' || color === 'bg-occ-secondary-orange') {
      return `${color} border border-gray-300`;
    }
    return color;
  };

  return (
    <div 
      className={`
        ${getBackgroundWithBorder()} rounded-lg p-3 sm:p-4 md:p-6 ${getTextColor()}
        transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1
        flex flex-col justify-between h-full min-h-[80px]
      `}
    >
      {/* Stage title with improved contrast */}
      <div className={`text-xs sm:text-sm font-semibold mb-1 ${getTextColor()}`}>
        {stage}
      </div>
      
      {/* Count with high contrast */}
      <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${getTextColor()}`}>
        {count}
      </div>
      
      {/* Trend with label only */}
      <div className={`flex items-center mt-1 text-xs ${getTrendTextColor()}`}>
        <span className="text-[10px] sm:text-xs font-semibold">
          {getTrendLabel()}: {trendValue}% from last month
        </span>
      </div>
    </div>
  );
};

export default ContractTile;