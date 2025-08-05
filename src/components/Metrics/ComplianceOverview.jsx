import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ChevronDown, Info, Shield, TrendingUp, AlertCircle, Target } from 'lucide-react';

const ComplianceOverview = ({ 
  complianceData = [], 
  loading = false 
}) => {
  const [selectedControl, setSelectedControl] = useState('overview');

  // Calculate overall compliance metrics
  const calculateOverallMetrics = () => {
    if (!complianceData || complianceData.length === 0) {
      return {
        percentage: 0,
        criticalIssues: 0,
        totalControls: 0,
        compliantCount: 0
      };
    }

    const totalControls = complianceData.length;
    const compliantCount = complianceData.filter(
      item => item.compliance_summary && item.compliance_summary.toLowerCase() === 'compliant'
    ).length;
    
    const percentage = totalControls > 0 ? Math.round((compliantCount / totalControls) * 100) : 0;
    
    const criticalIssues = complianceData.filter(
      item => item.risk_assessment === 'High' || item.closeout_status === 'Review Required'
    ).length;

    return { percentage, criticalIssues, totalControls, compliantCount };
  };

  const overallMetrics = calculateOverallMetrics();
  const selectedControlData = complianceData.find(item => 
    `${item.contract_id}-${item.clause_id}` === selectedControl
  );

  // Get display data based on selection
  const getDisplayData = () => {
    if (selectedControl === 'overview') {
      return {
        title: 'Overall Compliance',
        percentage: overallMetrics.percentage,
        isCompliant: overallMetrics.percentage >= 80,
        summary: `${overallMetrics.compliantCount} of ${overallMetrics.totalControls} controls compliant`,
        riskLevel: overallMetrics.criticalIssues > 0 ? 'High' : 'Low',
        status: overallMetrics.percentage >= 80 ? 'Compliant' : 'Review Required'
      };
    }

    if (selectedControlData) {
      const isCompliant = selectedControlData.compliance_summary && 
                         selectedControlData.compliance_summary.toLowerCase() === 'compliant';
      return {
        title: selectedControlData.title,
        percentage: isCompliant ? 100 : 0,
        isCompliant: isCompliant,
        summary: selectedControlData.compliance_summary,
        riskLevel: selectedControlData.risk_assessment,
        status: selectedControlData.closeout_status,
        contractId: selectedControlData.contract_id,
        clauseId: selectedControlData.clause_id
      };
    }

    return getDisplayData(); // fallback to overview
  };

  const displayData = getDisplayData();

  // Enhanced color scheme
  const getStatusTheme = () => {
    if (displayData.percentage >= 80) {
      return {
        gradient: 'from-emerald-50 to-green-100',
        border: 'border-emerald-200',
        primary: 'bg-emerald-500',
        secondary: 'bg-emerald-50',
        text: 'text-emerald-600',
        stroke: '#10B981',
        accent: 'emerald'
      };
    } else if (displayData.percentage >= 60) {
      return {
        gradient: 'from-blue-50 to-indigo-100',
        border: 'border-blue-200',
        primary: 'bg-blue-500',
        secondary: 'bg-blue-50',
        text: 'text-blue-600',
        stroke: '#3B82F6',
        accent: 'blue'
      };
    } else if (displayData.percentage >= 40) {
      return {
        gradient: 'from-amber-50 to-yellow-100',
        border: 'border-amber-200',
        primary: 'bg-amber-500',
        secondary: 'bg-amber-50',
        text: 'text-amber-600',
        stroke: '#F59E0B',
        accent: 'amber'
      };
    } else {
      return {
        gradient: 'from-red-50 to-rose-100',
        border: 'border-red-200',
        primary: 'bg-red-500',
        secondary: 'bg-red-50',
        text: 'text-red-600',
        stroke: '#EF4444',
        accent: 'red'
      };
    }
  };

  const theme = getStatusTheme();
  const circumference = 2 * Math.PI * 45; // Reduced radius
  const strokeDashoffset = circumference - (displayData.percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-3 sm:p-4 lg:p-6 shadow-lg">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
              <div className="space-y-1">
                <div className="h-4 bg-slate-300 rounded w-32"></div>
                <div className="h-3 bg-slate-300 rounded w-24"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-300 rounded-lg w-full sm:w-48"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-300 rounded-full mx-auto lg:mx-0"></div>
            <div className="flex-1 w-full space-y-4">
              <div className="h-20 bg-slate-300 rounded-xl"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-16 bg-slate-300 rounded-lg"></div>
                <div className="h-16 bg-slate-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${theme.gradient} rounded-xl border ${theme.border} p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 ${theme.primary} rounded-lg shadow-sm`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Compliance Overview</h3>
            <p className="text-xs text-gray-600">Real-time monitoring</p>
          </div>
        </div>
        
        {/* Dropdown - FIXED WITH UNIQUE KEYS */}
        <div className="relative w-full sm:w-64">
          <select
            value={selectedControl}
            onChange={(e) => setSelectedControl(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-10 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          >
            <option value="overview">📊 Overall Compliance</option>
            {complianceData.map((item, index) => (
              <option 
                key={item.uniqueId || `${item.contract_id}-${item.clause_id}-${index}`} 
                value={`${item.contract_id}-${item.clause_id}`}
              >
                📋 {item.title} - {item.contract_id}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Circular Progress Chart */}
        <div className="relative mx-auto lg:mx-0 lg:flex-shrink-0">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32">
            <svg 
              width="128" 
              height="128" 
              viewBox="0 0 128 128"
              className="absolute inset-0 transform -rotate-90 w-full h-full"
            >
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
                className="opacity-30"
              />
              
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke={theme.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`flex items-center justify-center w-6 h-6 ${theme.secondary} rounded-full mb-1 border ${theme.border}`}>
                {displayData.isCompliant ? (
                  <CheckCircle className={`w-3 h-3 ${theme.text}`} />
                ) : (
                  <AlertTriangle className={`w-3 h-3 ${theme.text}`} />
                )}
              </div>
              <div className={`text-lg sm:text-xl font-bold ${theme.text}`}>{displayData.percentage}%</div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 w-full space-y-4">
          {/* Control Information Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex gap-3">
              <div className={`flex items-center justify-center w-7 h-7 ${theme.secondary} rounded-lg border ${theme.border} flex-shrink-0`}>
                <Target className={`w-3 h-3 ${theme.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{displayData.title}</h4>
                
                {displayData.contractId && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      {displayData.contractId}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {displayData.clauseId}
                    </span>
                  </div>
                )}
                
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{displayData.summary}</p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Compliance Status Card */}
            <div className={`bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-200 hover:shadow-md ${
              displayData.isCompliant 
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50' 
                : 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shadow-sm ${
                  displayData.isCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {displayData.isCompliant ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                  <div className={`text-sm font-semibold truncate ${
                    displayData.isCompliant ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {displayData.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment Card */}
            <div className={`bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-200 hover:shadow-md ${
              displayData.riskLevel === 'High' 
                ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50' 
                : 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shadow-sm ${
                  displayData.riskLevel === 'High' ? 'bg-red-500' : 'bg-emerald-500'
                }`}>
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Risk Level</div>
                  <div className={`text-sm font-semibold truncate ${
                    displayData.riskLevel === 'High' ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    {displayData.riskLevel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          {selectedControl === 'overview' && overallMetrics.totalControls > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Critical Issues */}
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-lg shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Critical Issues</div>
                    <div className="text-lg font-bold text-orange-700">
                      {overallMetrics.criticalIssues}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Controls */}
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg shadow-sm">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Controls</div>
                    <div className="text-lg font-bold text-blue-700">
                      {overallMetrics.totalControls}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Overall Progress</span>
          <span className={`text-sm font-semibold ${theme.text}`}>{displayData.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out`}
            style={{ 
              width: `${displayData.percentage}%`,
              backgroundColor: theme.stroke
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceOverview;