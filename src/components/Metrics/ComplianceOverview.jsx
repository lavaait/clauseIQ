import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ComplianceOverview = ({ percentage = 83 }) => {
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const nonCompliantPercentage = 100 - percentage;

  return (
    <div className="bg-occ-secondary-white rounded-lg shadow-lg border border-occ-secondary-gray p-3 sm:p-4 md:p-6 no-scrollbar">
      <h3 
        id="compliance-title"
        className="text-base md:text-lg font-semibold occ-secondary-black mb-2 md:mb-4"
      >
        Compliance Overview
      </h3>
      
      {/* Screen reader accessible summary */}
      <div className="sr-only" aria-labelledby="compliance-title">
        Compliance status: {percentage}% compliant, {nonCompliantPercentage}% non-compliant.
        Critical issues: 3 open. Last audit: June 12, 2023.
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center h-auto sm:h-40">
        <div className="relative mb-4 sm:mb-0">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
            role="img"
            aria-labelledby="compliance-title"
            aria-describedby="compliance-desc"
          >
            <desc id="compliance-desc">
              Circular progress chart showing {percentage}% compliance rate
            </desc>
            
            {/* Background circle with high contrast pattern for accessibility */}
            <defs>
              <pattern id="nonCompliantPattern" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="#E6E6E6"/>
                <path d="M 0,6 l 6,-6 M -1.5,1.5 l 3,-3 M 4.5,7.5 l 3,-3" stroke="#98999B" strokeWidth="1.5"/>
              </pattern>
            </defs>
            
            {/* Non-compliant background circle with pattern */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#nonCompliantPattern)"
              strokeWidth="10"
            />
            
            {/* Compliant portion - OCC Blue */}
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
            <span className="text-xs occ-gray">Overall</span>
          </div>
        </div>
        
        <div className="sm:ml-4 md:ml-6 w-full sm:w-auto">
          <div className="grid grid-cols-1 sm:block gap-2">
            {/* Compliant status with pattern, icon, and text */}
            <div className="flex items-center mb-3 p-3 rounded-md border-2 border-occ-blue bg-occ-secondary-gray">
              <div className="flex items-center mr-3">
                <div className="w-4 h-4 bg-occ-blue rounded-full mr-2" aria-hidden="true"></div>
                <CheckCircle className="w-4 h-4 occ-blue" aria-hidden="true" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm occ-secondary-black font-medium">Compliant:</span>
                <span className="text-sm font-bold occ-secondary-black sm:ml-2">{percentage}%</span>
              </div>
            </div>
            
            {/* Non-compliant status with pattern, icon, and text */}
            <div className="flex items-center mb-3 p-3 rounded-md border-2 border-occ-gray bg-occ-secondary-gray">
              <div className="flex items-center mr-3">
                <div 
                  className="w-4 h-4 rounded-full mr-2 border-2 border-occ-gray" 
                  style={{
                    background: 'repeating-linear-gradient(45deg, #E6E6E6, #E6E6E6 2px, #98999B 2px, #98999B 4px)'
                  }}
                  aria-hidden="true"
                ></div>
                <AlertTriangle className="w-4 h-4 occ-gray" aria-hidden="true" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm occ-secondary-black font-medium">Non-Compliant:</span>
                <span className="text-sm font-bold occ-secondary-black sm:ml-2">{nonCompliantPercentage}%</span>
              </div>
            </div>
          </div>
          
          {/* Desktop additional info */}
          <div className="hidden sm:block mt-4 border-t-2 border-occ-secondary-gray pt-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col p-2 bg-occ-secondary-gray rounded border border-occ-secondary-orange">
                <span className="occ-secondary-black font-medium">Critical Issues</span>
                <span className="font-bold occ-secondary-orange">3 open</span>
              </div>
              <div className="flex flex-col p-2 bg-occ-secondary-gray rounded border border-occ-gray">
                <span className="occ-secondary-black font-medium">Last Audit</span>
                <span className="font-bold occ-secondary-black">June 12, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile view for additional info */}
      <div className="sm:hidden mt-4 pt-3 border-t-2 border-occ-secondary-gray">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col p-2 bg-occ-secondary-gray rounded border border-occ-secondary-orange">
            <span className="occ-secondary-black font-medium">Critical Issues</span>
            <span className="font-bold occ-secondary-orange">3 open</span>
          </div>
          <div className="flex flex-col p-2 bg-occ-secondary-gray rounded border border-occ-gray">
            <span className="occ-secondary-black font-medium">Last Audit</span>
            <span className="font-bold occ-secondary-black">June 12, 2023</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceOverview;