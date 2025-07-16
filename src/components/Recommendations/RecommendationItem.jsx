import React from 'react';
import '../occ-colors.css';

const RecommendationItem = ({ text, priority = 'medium' }) => {
  
  const priorityColors = {
    high: {
      bg: { backgroundColor: 'rgba(246, 142, 50, 0.1)' }, 
      border: 'border-occ-secondary-orange'
    },
    medium: {
      bg: { backgroundColor: 'rgba(0, 90, 202, 0.1)' }, 
      border: 'border-occ-blue'
    },
    low: {
      bg: { backgroundColor: 'rgba(255, 206, 0, 0.1)' }, 
      border: 'border-occ-yellow'
    }
  };

  const selectedPriority = priorityColors[priority] || priorityColors.medium;

  return (
    <div 
      className={`
        flex items-start space-x-2 sm:space-x-3 py-1.5 sm:py-2 
        transition-all duration-200 rounded-r-md
        border-l-2 ${selectedPriority.border}
        pl-1 sm:pl-2
      `}
      style={selectedPriority.bg}
    >
      <div 
        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(0, 90, 202, 0.15)' }} 
      >
        <span className="text-sm sm:text-base">🤖</span>
      </div>
      
      <div className="flex-1 min-w-0 pr-1">
        <div className="text-xs sm:text-sm occ-secondary-black line-clamp-2">
          {text}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] occ-gray">AI suggested</span>
            <span className="text-[10px] occ-gray">•</span>
            <span className="text-[10px] occ-gray">Just now</span>
          </div>
          
          <button 
            className="text-[10px] occ-blue"
            onMouseOver={(e) => e.target.classList.replace('occ-blue', 'occ-blue-dark')}
            onMouseOut={(e) => e.target.classList.replace('occ-blue-dark', 'occ-blue')}
          >
            Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationItem;