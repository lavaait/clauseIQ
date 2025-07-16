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

  return (
    <div className="flex items-start space-x-2 md:space-x-3 py-1.5 md:py-2">
      <span className="text-base md:text-lg flex-shrink-0 mt-0.5">{getEmoji(type)}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm text-gray-800 line-clamp-2">{text}</div>
        <div className="text-xs text-gray-500 mt-0.5 md:mt-1">{time}</div>
      </div>
    </div>
  );
};

export default ActivityItem;