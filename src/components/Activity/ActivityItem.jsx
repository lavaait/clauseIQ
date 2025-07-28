import React from 'react';

const ActivityItem = ({ type, text, time }) => {
  const getEmoji = (type) => {
    switch(type) {
      case 'check': return '✅';
      case 'upload': return '📤';
      case 'request': return '📥';
      default: return '📌';
    }
  };

  // Get activity type label for screen readers
  const getActivityLabel = (type) => {
    switch(type) {
      case 'check': return 'Completed';
      case 'upload': return 'Upload';
      case 'request': return 'Request';
      default: return 'Activity';
    }
  };

  return (
    <div 
      className="flex items-start space-x-2 md:space-x-3 py-1.5 md:py-2"
      role="listitem"
    >
      {/* Icon with screen reader label */}
      <span 
        className="text-base md:text-lg flex-shrink-0 mt-0.5" 
        aria-label={getActivityLabel(type)}
        role="img"
      >
        {getEmoji(type)}
      </span>
      
      <div className="flex-1 min-w-0">
        {/* Activity text with better contrast */}
        <div className="text-xs sm:text-sm text-gray-900 line-clamp-2 font-medium">
          {text}
        </div>
        
        {/* Time with better contrast and semantic meaning */}
        <time 
          className="text-xs text-gray-600 mt-0.5 md:mt-1 font-medium" 
          dateTime={time}
        >
          {time}
        </time>
      </div>
    </div>
  );
};

export default ActivityItem;