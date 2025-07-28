import React from 'react';
import '../occ-colors.css';

const LineChart = ({ data, title, loading }) => {
  // If no data or loading, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="bg-occ-secondary-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">{title}</h3>
        <div className="h-32 sm:h-36 md:h-40 relative flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>
    );
  }

  // Calculate max value for scaling
  const allValues = data.flatMap(point => [
    point.intake || 0,
    point.evaluation || 0,
    point.performance || 0,
    point.closeout || 0
  ]);
  const maxValue = Math.max(...allValues, 1);
  const scale = 100 / maxValue;

  // Colors for different lines
  const colors = {
    intake: '#005ACA', // occ-blue
    evaluation: '#FFB000', // occ-yellow
    performance: '#0EA5E9', // occ-secondary-blue
    closeout: '#F97316' // occ-secondary-orange
  };

  return (
    <div className="bg-occ-secondary-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">{title}</h3>
      
      <div className="h-32 sm:h-36 md:h-40 relative">
        <svg 
          viewBox="0 0 400 120" 
          className="w-full h-full" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis gridlines */}
          <line x1="40" y1="20" x2="400" y2="20" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="40" y1="40" x2="400" y2="40" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="40" y1="60" x2="400" y2="60" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="40" y1="80" x2="400" y2="80" stroke="#E6E6E6" strokeWidth="1" />
          <line x1="40" y1="100" x2="400" y2="100" stroke="#E6E6E6" strokeWidth="1" />
          
          {/* Y-axis */}
          <line x1="40" y1="20" x2="40" y2="100" stroke="#E6E6E6" strokeWidth="1" />
          
          {/* Draw lines for each metric */}
          {['intake', 'evaluation', 'performance', 'closeout'].map(metric => (
            <g key={metric}>
              {/* Draw line segments */}
              {data.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = data[index - 1];
                const x1 = 40 + ((index - 1) * (360 / (data.length - 1)));
                const y1 = 100 - ((prevPoint[metric] || 0) * scale * 0.8);
                const x2 = 40 + (index * (360 / (data.length - 1)));
                const y2 = 100 - ((point[metric] || 0) * scale * 0.8);
                
                return (
                  <line
                    key={`${metric}-line-${index}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={colors[metric]}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                );
              })}
              
              {/* Draw points */}
              {data.map((point, index) => {
                const x = 40 + (index * (360 / Math.max(data.length - 1, 1)));
                const y = 100 - ((point[metric] || 0) * scale * 0.8);
                
                return (
                  <circle
                    key={`${metric}-point-${index}`}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={colors[metric]}
                    opacity="0.9"
                  />
                );
              })}
            </g>
          ))}
          
          {/* Month labels */}
          {data.map((point, index) => {
            const x = 40 + (index * (360 / Math.max(data.length - 1, 1)));
            return (
              <text
                key={`month-${index}`}
                x={x}
                y={115}
                textAnchor="middle"
                className="text-[8px] sm:text-[10px] md:text-xs"
                fill="#374151"
                dy="0.35em"
              >
                {point.month}
              </text>
            );
          })}
          
          {/* Y-axis labels */}
          <text x="35" y="25" className="text-[8px] sm:text-[10px]" fill="#374151" textAnchor="end">{Math.round(maxValue * 0.8)}</text>
          <text x="35" y="45" className="text-[8px] sm:text-[10px]" fill="#374151" textAnchor="end">{Math.round(maxValue * 0.6)}</text>
          <text x="35" y="65" className="text-[8px] sm:text-[10px]" fill="#374151" textAnchor="end">{Math.round(maxValue * 0.4)}</text>
          <text x="35" y="85" className="text-[8px] sm:text-[10px]" fill="#374151" textAnchor="end">{Math.round(maxValue * 0.2)}</text>
          <text x="35" y="105" className="text-[8px] sm:text-[10px]" fill="#374151" textAnchor="end">0</text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 text-xs text-gray-700">
        <div className="flex items-center">
          <div className="w-3 h-1 rounded" style={{backgroundColor: colors.intake}}></div>
          <span className="ml-1">Intake</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-1 rounded" style={{backgroundColor: colors.evaluation}}></div>
          <span className="ml-1">Evaluation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-1 rounded" style={{backgroundColor: colors.performance}}></div>
          <span className="ml-1">Performance</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-1 rounded" style={{backgroundColor: colors.closeout}}></div>
          <span className="ml-1">Closeout</span>
        </div>
      </div>
    </div>
  );
};

export default LineChart;