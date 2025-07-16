import React from 'react';
import '../occ-colors.css';

const LineChart = ({ data, title }) => {
  return (
    <div className="bg-occ-secondary-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold occ-secondary-black mb-2 md:mb-4">{title}</h3>
      <div className="h-32 sm:h-36 md:h-40 relative">
        <svg 
          viewBox="0 0 400 120" 
          className="w-full h-full" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis gridlines */}
          <line x1="0" y1="30" x2="400" y2="30" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="0" y1="60" x2="400" y2="60" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="#E6E6E6" strokeWidth="1" />
          
          {/* Data points and lines */}
          {data.map((point, index) => (
            <g key={index}>
              {index > 0 && (
                <line
                  x1={index * 60}
                  y1={120 - data[index - 1].value * 2}
                  x2={(index + 1) * 60}
                  y2={120 - point.value * 2}
                  stroke="#005ACA"
                  strokeWidth="1.5"
                  className="md:stroke-2"
                />
              )}
              <circle
                cx={(index + 1) * 60}
                cy={120 - point.value * 2}
                r="3"
                className="md:r-4"
                fill="#005ACA"
              />
              <text
                x={(index + 1) * 60}
                y={115}
                textAnchor="middle"
                className="text-[8px] sm:text-[10px] md:text-xs fill-occ-gray"
                dy="0.35em"
              >
                {point.month}
              </text>
            </g>
          ))}
          
          {/* Y-axis labels */}
          <text x="10" y="30" className="text-[8px] sm:text-[10px] fill-occ-gray" textAnchor="start">40</text>
          <text x="10" y="60" className="text-[8px] sm:text-[10px] fill-occ-gray" textAnchor="start">30</text>
          <text x="10" y="90" className="text-[8px] sm:text-[10px] fill-occ-gray" textAnchor="start">20</text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-2 text-xs occ-gray">
        <div className="flex items-center">
          <div className="w-3 h-1 bg-occ-blue mr-1"></div>
          <span>Cycle Time (Days)</span>
        </div>
      </div>
    </div>
  );
};

export default LineChart;