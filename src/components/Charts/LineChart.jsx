import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, BarChart3, Activity, Info } from 'lucide-react';
import '../occ-colors.css';

const LineChart = ({ data, title, loading }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 240 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const isMobileView = window.innerWidth < 768;
        
        if (isMobileView) {
          // Mobile dimensions
          setDimensions({ 
            width: Math.max(width - 24, 280), // Less padding for mobile
            height: Math.min(width * 0.8, 220) // Taller aspect ratio for mobile
          });
        } else {
          // Desktop dimensions
          setDimensions({ 
            width: Math.max(width - 48, 300),
            height: Math.min(width * 0.5, 280)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Mobile-responsive loading skeleton
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
      <div className="animate-pulse space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-24 sm:w-32 mt-1 sm:mt-2"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-12 sm:w-16"></div>
        </div>
        
        <div className="relative">
          <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-400">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">Loading chart data...</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-2 w-4 sm:h-3 sm:w-6 bg-gray-200 rounded"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-12 sm:w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile-responsive empty state
  const EmptyState = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Performance metrics over time</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
        </div>
        <div className="text-center space-y-1 sm:space-y-2">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">No Data Available</h4>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm px-4">
            Chart data will appear here once cycle time metrics are collected from your system.
          </p>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // Calculate chart dimensions and scaling
  const chartWidth = dimensions.width;
  const chartHeight = dimensions.height;
  
  // Responsive padding
  const padding = isMobile 
    ? { top: 20, right: 20, bottom: 45, left: 50 } 
    : { top: 30, right: 30, bottom: 60, left: 70 };
    
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Get all values for proper scaling
  const allValues = data.flatMap(point => [
    point.intake || 0,
    point.evaluation || 0,
    point.performance || 0,
    point.closeout || 0
  ]).filter(val => val > 0);

  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 10;
  const minValue = 0;
  const valueRange = maxValue - minValue || 1;

  // Scale functions
  const xScale = (index) => padding.left + (index * (innerWidth / Math.max(data.length - 1, 1)));
  const yScale = (value) => padding.top + innerHeight - ((value - minValue) / valueRange * innerHeight);

  // Chart configuration with modern colors
  const metrics = [
    { key: 'intake', label: 'Intake', color: '#3B82F6', lightColor: '#DBEAFE' },
    { key: 'evaluation', label: 'Evaluation', color: '#F59E0B', lightColor: '#FEF3C7' },
    { key: 'performance', label: 'Performance', color: '#10B981', lightColor: '#D1FAE5' },
    { key: 'closeout', label: 'Closeout', color: '#EF4444', lightColor: '#FEE2E2' }
  ];

  // Generate grid lines (fewer on mobile)
  const gridLines = [];
  const numGridLines = isMobile ? 3 : 5;
  for (let i = 0; i <= numGridLines; i++) {
    const value = minValue + (valueRange * i / numGridLines);
    const y = yScale(value);
    gridLines.push({ y, value: Math.round(value * 10) / 10 });
  }

  // Generate smooth path for each metric
  const generateSmoothPath = (metric) => {
    const points = data.map((point, index) => ({
      x: xScale(index),
      y: yScale(point[metric] || 0),
      value: point[metric] || 0
    }));

    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const midX = (prevPoint.x + currentPoint.x) / 2;
      path += ` Q ${midX} ${prevPoint.y}, ${midX} ${(prevPoint.y + currentPoint.y) / 2}`;
      path += ` Q ${midX} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return path;
  };

  // Calculate total for each month
  const getTotalForMonth = (point) => {
    return (point.intake || 0) + (point.evaluation || 0) + (point.performance || 0) + (point.closeout || 0);
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Responsive Header */}
      <div className="px-3 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Days per stage over time</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{data.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Months</div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-3 sm:p-6">
        <div ref={containerRef} className="relative">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="overflow-visible w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Gradient Definitions */}
            <defs>
              {metrics.map(metric => (
                <linearGradient
                  key={`gradient-${metric.key}`}
                  id={`gradient-${metric.key}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={metric.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={metric.color} stopOpacity="0.02" />
                </linearGradient>
              ))}
            </defs>

            {/* Grid Lines */}
            {gridLines.map((line, index) => (
              <g key={`grid-${index}`}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={chartWidth - padding.right}
                  y2={line.y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                  strokeDasharray={index === 0 ? "none" : "2,2"}
                />
                <text
                  x={padding.left - (isMobile ? 8 : 12)}
                  y={line.y}
                  textAnchor="end"
                  dy="0.35em"
                  className={`${isMobile ? 'text-xs' : 'text-sm'} fill-gray-500 font-medium`}
                >
                  {line.value}
                </text>
              </g>
            ))}

            {/* Metric Lines and Areas */}
            {metrics.map(metric => {
              const path = generateSmoothPath(metric.key);
              if (!path) return null;

              return (
                <g key={metric.key}>
                  {/* Area under curve */}
                  <path
                    d={`${path} L ${xScale(data.length - 1)} ${yScale(minValue)} L ${xScale(0)} ${yScale(minValue)} Z`}
                    fill={`url(#gradient-${metric.key})`}
                  />
                  
                  {/* Main line */}
                  <path
                    d={path}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth={isMobile ? "2" : "3"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                  />

                  {/* Data Points */}
                  {data.map((point, index) => {
                    const value = point[metric.key] || 0;
                    if (value === 0) return null;

                    const x = xScale(index);
                    const y = yScale(value);
                    const isHovered = hoveredPoint?.metric === metric.key && hoveredPoint?.index === index;

                    return (
                      <g key={`${metric.key}-point-${index}`}>
                        {/* Outer glow for hovered point */}
                        {isHovered && (
                          <circle
                            cx={x}
                            cy={y}
                            r={isMobile ? "8" : "12"}
                            fill={metric.color}
                            opacity="0.1"
                            className="animate-pulse"
                          />
                        )}
                        
                        {/* Main data point */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? (isMobile ? "5" : "6") : (isMobile ? "3" : "4")}
                          fill="white"
                          stroke={metric.color}
                          strokeWidth={isMobile ? "2" : "3"}
                          className="cursor-pointer transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
                          onMouseEnter={() => setHoveredPoint({ 
                            metric: metric.key, 
                            index, 
                            value, 
                            month: point.month,
                            total: getTotalForMonth(point),
                            x: x,
                            y: y
                          })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onTouchStart={() => setHoveredPoint({ 
                            metric: metric.key, 
                            index, 
                            value, 
                            month: point.month,
                            total: getTotalForMonth(point),
                            x: x,
                            y: y
                          })}
                          onTouchEnd={() => setTimeout(() => setHoveredPoint(null), 2000)}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* X-axis labels */}
            {data.map((point, index) => (
              <text
                key={`month-${index}`}
                x={xScale(index)}
                y={chartHeight - padding.bottom + (isMobile ? 20 : 25)}
                textAnchor="middle"
                className={`${isMobile ? 'text-xs' : 'text-sm'} fill-gray-600 font-medium`}
              >
                {isMobile ? point.month.slice(0, 3) : point.month}
              </text>
            ))}

            {/* Axis labels */}
            <text
              x={padding.left - (isMobile ? 35 : 45)}
              y={chartHeight / 2}
              textAnchor="middle"
              className={`${isMobile ? 'text-xs' : 'text-sm'} fill-gray-600 font-medium`}
              transform={`rotate(-90, ${padding.left - (isMobile ? 35 : 45)}, ${chartHeight / 2})`}
            >
              Days
            </text>
          </svg>

          {/* Enhanced Responsive Tooltip */}
          {hoveredPoint && (
            <div 
              className={`absolute z-20 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-3 pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-max max-w-xs ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 15
              }}
            >
              <div className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 mb-1`}>
                {hoveredPoint.month}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 capitalize mb-1`}>
                <span className="font-medium" style={{ color: metrics.find(m => m.key === hoveredPoint.metric)?.color }}>
                  {metrics.find(m => m.key === hoveredPoint.metric)?.label}
                </span>
                : <span className="font-bold">{hoveredPoint.value} days</span>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-1">
                Total: {hoveredPoint.total} days
              </div>
            </div>
          )}
        </div>

        {/* Responsive Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
          {metrics.map(metric => {
            const hasData = data.some(point => (point[metric.key] || 0) > 0);
            return (
              <div 
                key={metric.key} 
                className={`flex items-center space-x-1 sm:space-x-2 group cursor-pointer transition-opacity ${
                  hasData ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className="relative">
                  <div 
                    className="w-3 h-2 sm:w-4 sm:h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  {hasData && (
                    <div 
                      className="absolute inset-0 w-3 h-2 sm:w-4 sm:h-3 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ backgroundColor: metric.color }}
                    ></div>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {metric.label}
                </span>
                {!hasData && (
                  <span className="text-xs text-gray-400">(No data)</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Responsive Summary Stats */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {metrics.map(metric => {
              const values = data.map(point => point[metric.key] || 0).filter(v => v > 0);
              const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
              const max = values.length > 0 ? Math.max(...values) : 0;
              
              return (
                <div key={`stat-${metric.key}`} className="text-center">
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold`} style={{ color: metric.color }}>
                    {avg} days
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    Avg {metric.label}
                  </div>
                  {max > 0 && (
                    <div className="text-xs text-gray-400">
                      Max: {max} days
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChart;