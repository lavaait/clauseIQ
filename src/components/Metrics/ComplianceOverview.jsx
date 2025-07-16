import React from 'react';
import '../occ-colors.css';

const ComplianceOverview = ({ percentage = 83 }) => {
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
 
  const nonCompliantPercentage = 100 - percentage;

  return (
    <div className="bg-occ-secondary-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold occ-secondary-black mb-2 md:mb-4">Compliance Overview</h3>
      
      <div className="flex flex-col sm:flex-row items-center justify-center h-auto sm:h-40">
        <div className="relative mb-4 sm:mb-0">
          <svg 
            width="100" 
            height="100" 
            viewBox="0 0 120 120"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#E6E6E6"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#005ACA"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold occ-blue">{percentage}%</span>
            <span className="text-[10px] occ-gray">Overall</span>
          </div>
        </div>
        
        <div className="sm:ml-4 md:ml-6 w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:block gap-2">
            <div className="flex items-center mb-2 p-2 rounded-md sm:p-0" 
                 style={{ backgroundColor: 'rgba(0, 90, 202, 0.1)' }}>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-occ-blue rounded-full mr-2"></div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-xs sm:text-sm occ-gray">Compliant:</span>
                <span className="text-xs sm:text-sm font-semibold occ-secondary-black sm:ml-1">{percentage}%</span>
              </div>
            </div>
            
            <div className="flex items-center p-2 rounded-md sm:p-0"
                 style={{ backgroundColor: 'rgba(152, 153, 155, 0.1)' }}>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-occ-gray rounded-full mr-2"></div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-xs sm:text-sm occ-gray">Non-Compliant:</span>
                <span className="text-xs sm:text-sm font-semibold occ-secondary-black sm:ml-1">{nonCompliantPercentage}%</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block mt-4 border-t pt-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="occ-gray">Critical Issues</span>
                <span className="font-medium" style={{ color: '#F68E32' }}>3 open</span>
              </div>
              <div className="flex flex-col">
                <span className="occ-gray">Last Audit</span>
                <span className="font-medium occ-secondary-black">June 12, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sm:hidden mt-4 pt-3 border-t">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="occ-gray">Critical Issues</span>
            <span className="font-medium" style={{ color: '#F68E32' }}>3 open</span>
          </div>
          <div className="flex flex-col">
            <span className="occ-gray">Last Audit</span>
            <span className="font-medium occ-secondary-black">June 12, 2023</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceOverview;