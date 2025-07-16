import React from 'react';

const ContractTile = ({ stage, count, color }) => {
  return (
    <div 
      className={`
        ${color} rounded-lg p-3 sm:p-4 md:p-6 text-white 
        transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1
        flex flex-col justify-between h-full min-h-[80px]
      `}
    >
      <div className="text-xs sm:text-sm font-medium mb-1">{stage}</div>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold">{count}</div>
      
      {/* Optional indicator arrow based on data trend */}
      <div className="flex items-center mt-1 text-xs opacity-80">
        <span className="text-[10px] sm:text-xs">
          {Math.random() > 0.5 ? '↑ 12%' : '↓ 8%'} from last month
        </span>
      </div>
    </div>
  );
};

export default ContractTile;