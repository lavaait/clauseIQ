import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, AlertTriangle, CheckCircle, XCircle, 
  FileSearch, Scale, Shield, Download, Eye, ChevronRight,
  AlertCircle, Zap, Target, BarChart3, FileWarning,
  GitCompare, FileCheck, Edit3, Save, X, Loader,
  ChevronDown, Info, FileUp, History, ArrowUpDown, Menu
} from 'lucide-react';
import '../occ-colors.css';

// Get API base URL from environment variable
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ContractAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClause, setSelectedClause] = useState(null);
  const [showRedlineModal, setShowRedlineModal] = useState(false);
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/third_party_analyzer/api/analyze`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analysis results:', data);
      setAnalysisResults(data);
      
    } catch (error) {
      console.error('Error analyzing contract:', error);
      setError(error.message || 'Failed to analyze contract. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download analysis report as PDF
  const downloadAnalysisReport = async () => {
    if (!analysisResults) return;
    
    setIsDownloading(true);
    try {
      const reportContent = generateReportContent();
      downloadTextFile(reportContent, `contract_analysis_report_${new Date().toISOString().split('T')[0]}.txt`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (!analysisResults) return;
    
    setIsDownloading(true);
    try {
      const csvContent = generateCSVContent();
      downloadTextFile(csvContent, `contract_analysis_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate report content
  const generateReportContent = () => {
    const riskScores = getRiskScores();
    const riskCounts = analysisResults.results.reduce((acc, clause) => {
      if (clause.risk_status !== 'OK') {
        const level = clause.confidence > 0.8 ? 'critical' : 
                      clause.confidence > 0.5 ? 'high' : 'medium';
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });

    return `CONTRACT ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
Contract: ${uploadedFile?.name || 'Unknown'}

EXECUTIVE SUMMARY
================
Total Clauses Analyzed: ${analysisResults.num_clauses}
Total Issues Found: ${analysisResults.total_flagged}
Overall Compliance Score: ${riskScores.overall}%

RISK BREAKDOWN
==============
Critical Issues: ${riskCounts.critical}
High Risk Issues: ${riskCounts.high}
Medium Risk Issues: ${riskCounts.medium}
Low Risk Issues: ${riskCounts.low}

DETAILED ANALYSIS
================
${analysisResults.results.map((clause, index) => `
Clause ${index + 1}: ${clause.clause_type}
Risk Status: ${clause.risk_status}
Confidence: ${Math.round(clause.confidence * 100)}%
Text: ${clause.clause_text}
Analysis: ${clause.reasoning || 'No detailed analysis available'}
Recommendation: ${clause.risk_guidance || 'No specific guidance available'}
${'='.repeat(80)}
`).join('')}

AI HIGHLIGHTS
=============
${analysisResults.ai_highlights.map((highlight, index) => `${index + 1}. ${highlight}`).join('\n')}

RECOMMENDATIONS
===============
1. Review and address all critical and high-risk issues immediately
2. Implement suggested changes from the AI analysis
3. Consider legal review for complex clauses
4. Update contract templates to prevent future issues
5. Regular compliance monitoring recommended

Report generated by Third-Party Contract Analyzer
`;
  };

  // Generate CSV content for Excel export
  const generateCSVContent = () => {
    const headers = ['Clause Number', 'Clause Type', 'Risk Status', 'Confidence %', 'Risk Level', 'Clause Text', 'Analysis', 'Recommendation'];
    
    const rows = analysisResults.results.map((clause, index) => {
      const riskLevel = clause.risk_status === 'OK' ? 'Low' : 
                       clause.confidence > 0.8 ? 'Critical' : 
                       clause.confidence > 0.5 ? 'High' : 'Medium';
      
      return [
        index + 1,
        clause.clause_type || 'Unknown',
        clause.risk_status,
        Math.round(clause.confidence * 100),
        riskLevel,
        `"${(clause.clause_text || '').replace(/"/g, '""')}"`,
        `"${(clause.reasoning || '').replace(/"/g, '""')}"`,
        `"${(clause.risk_guidance || '').replace(/"/g, '""')}"`
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download file utility
  const downloadTextFile = (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate contract structure from API results
  const getContractStructure = () => {
    if (!analysisResults || !analysisResults.results) return [];
    
    const groupedByType = analysisResults.results.reduce((acc, clause, index) => {
      const type = clause.clause_type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({
        id: index + 1,
        title: clause.clause_text.substring(0, 50) + '...',
        riskLevel: clause.risk_status === 'OK' ? 'low' : 'high',
        hasIssues: clause.risk_status !== 'OK',
        confidence: clause.confidence,
        fullClause: clause
      });
      return acc;
    }, {});

    return Object.entries(groupedByType).map(([type, clauses], index) => ({
      id: index + 1,
      title: type.charAt(0) + type.slice(1).toLowerCase(),
      riskLevel: clauses.some(c => c.hasIssues) ? 'high' : 'low',
      hasIssues: clauses.some(c => c.hasIssues),
      subsections: clauses
    }));
  };

  // Generate AI highlights from API results
  const getAIHighlights = () => {
    if (!analysisResults) return [];
    
    const highlights = [];
    
    // Add highlights from ai_highlights array
    if (analysisResults.ai_highlights) {
      analysisResults.ai_highlights.slice(0, 5).forEach((highlight, index) => {
        highlights.push({
          id: index + 1,
          type: highlight.includes('misaligned') ? 'critical' : 'warning',
          message: highlight,
          recommendation: 'Review and update clause to meet standards',
          icon: highlight.includes('misaligned') ? AlertTriangle : AlertCircle
        });
      });
    }

    // Add summary highlight
    if (analysisResults.total_flagged > 0) {
      highlights.unshift({
        id: 0,
        type: 'critical',
        message: `${analysisResults.total_flagged} clauses flagged for review`,
        recommendation: `${analysisResults.num_clauses - analysisResults.total_flagged} clauses are compliant`,
        icon: AlertTriangle
      });
    }

    return highlights;
  };

  // Calculate risk scores from API results
  const getRiskScores = () => {
    if (!analysisResults || !analysisResults.results) {
      return {
        overall: 0,
        categories: []
      };
    }

    const totalClauses = analysisResults.results.length;
    const flaggedClauses = analysisResults.total_flagged || 0;
    const overall = Math.round(((totalClauses - flaggedClauses) / totalClauses) * 100);

    // Group by clause type for category scoring
    const typeGroups = analysisResults.results.reduce((acc, clause) => {
      const type = clause.clause_type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = { total: 0, flagged: 0 };
      }
      acc[type].total++;
      if (clause.risk_status !== 'OK') {
        acc[type].flagged++;
      }
      return acc;
    }, {});

    const categories = Object.entries(typeGroups).map(([type, data]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      score: Math.round(((data.total - data.flagged) / data.total) * 100),
      status: data.flagged === 0 ? 'good' : data.flagged / data.total > 0.5 ? 'critical' : 'warning'
    }));

    return { overall, categories };
  };

  // Get risk analysis by category
  const getRiskAnalysis = () => {
    if (!analysisResults || !analysisResults.results) return [];

    const categories = {};
    
    analysisResults.results.forEach(clause => {
      const type = clause.clause_type || 'UNKNOWN';
      if (!categories[type]) {
        categories[type] = [];
      }
      
      if (clause.risk_status !== 'OK') {
        categories[type].push({
          text: clause.clause_text.substring(0, 80) + '...',
          level: clause.confidence > 0.8 ? 'critical' : clause.confidence > 0.5 ? 'high' : 'medium',
          reasoning: clause.reasoning
        });
      }
    });

    return Object.entries(categories).map(([type, items]) => ({
      title: `${type.charAt(0) + type.slice(1).toLowerCase()} Risks`,
      items: items.slice(0, 5) // Limit to 5 items per category
    }));
  };

  const getRiskBadge = (level) => {
    const badges = {
      low: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
      high: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      critical: { color: 'bg-red-600 text-white', icon: XCircle }
    };
    
    const badge = badges[level] || badges.medium;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
      </span>
    );
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Generate data from API results
  const contractStructure = getContractStructure();
  const aiHighlights = getAIHighlights();
  const riskScores = getRiskScores();
  const riskAnalysis = getRiskAnalysis();

  // Count risk levels
  const riskCounts = analysisResults ? analysisResults.results.reduce((acc, clause) => {
    if (clause.risk_status !== 'OK') {
      const level = clause.confidence > 0.8 ? 'critical' : 
                    clause.confidence > 0.5 ? 'high' : 'medium';
      acc[level] = (acc[level] || 0) + 1;
    }
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 }) : { critical: 0, high: 0, medium: 0, low: 0 };

  return (
      <div className="min-h-screen bg-occ-secondary-white">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          
          {/* Enhanced Header - Perfect Mobile Experience */}
          <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-3 sm:mb-4 md:mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white opacity-5 rounded-full -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32"></div>
            
            <div className="relative z-10">
              {/* Header Content */}
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Title Section */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                      <Scale className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                      <span className="truncate">Third-Party Contract Analyzer</span>
                    </h1>
                    <p className="text-white opacity-90 mt-1 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      AI-powered contract review and risk assessment
                    </p>
                  </div>

                  {/* Desktop Upload Button */}
                  <div className="hidden sm:block">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="bg-occ-yellow hover:bg-yellow-500 text-occ-blue-dark px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Contract
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Upload Button - Always Visible and Prominent */}
                <div className="sm:hidden">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="w-full bg-occ-yellow hover:bg-yellow-500 active:bg-yellow-600 text-occ-blue-dark px-4 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
                    style={{ minHeight: '56px' }} // Ensure proper touch target size
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>AI is Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span>Upload Contract to Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </div>
          </div>

          {/* Floating Upload Button for Mobile - Alternative approach */}
          {!uploadedFile && !isAnalyzing && (
            <div className="sm:hidden fixed bottom-6 right-4 z-50">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 bg-occ-yellow hover:bg-yellow-500 active:bg-yellow-600 text-occ-blue-dark rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                style={{ 
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Upload className="w-7 h-7" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 md:mb-6 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 text-sm sm:text-base">Analysis Failed</h3>
                <p className="text-red-700 text-xs sm:text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Status Bar - Responsive */}
          {uploadedFile && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{uploadedFile.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    {analysisResults && ` • ${analysisResults.num_clauses} clauses analyzed`}
                  </p>
                </div>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="font-medium text-sm sm:text-base">Analyzing...</span>
                </div>
              ) : analysisResults ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="font-medium text-green-600 text-sm sm:text-base">Analysis Complete</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Navigation Tabs - Scrollable on Mobile */}
          {analysisResults && (
            <div className="bg-white rounded-lg shadow-md mb-3 sm:mb-4 md:mb-6 overflow-x-auto">
              <div className="flex min-w-full">
                {['overview', 'risks', 'details'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm capitalize whitespace-nowrap transition-all border-b-2 flex-1 sm:flex-initial ${
                      activeTab === tab
                        ? 'text-occ-blue border-occ-blue bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1 sm:gap-2">
                      {tab === 'overview' && <FileSearch className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {tab === 'risks' && <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {tab === 'details' && <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="hidden sm:inline">{tab}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          {!analysisResults && !isAnalyzing && (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <FileSearch className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Upload a contract to begin analysis
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6 sm:mb-8">
                Our AI will analyze your contract for risks, compliance issues, and provide actionable insights.
              </p>
              
              {/* Large Upload Area for Desktop */}
              <div className="hidden sm:block">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-occ-blue hover:bg-occ-blue-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center gap-2 sm:gap-3 mx-auto transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  Choose File
                </button>
              </div>

              {/* Mobile Upload Hint */}
              <div className="sm:hidden">
                <p className="text-sm text-gray-500 mb-4">
                  Tap the upload button above to get started
                </p>
                <div className="mx-auto w-16 h-1 bg-occ-yellow rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {analysisResults && activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Contract Structure */}
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                  Contract Analysis ({analysisResults.num_clauses} clauses)
                </h2>
                
                <div className="space-y-2 sm:space-y-3">
                  {contractStructure.map((section) => (
                    <div key={section.id}>
                      <div
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                          section.hasIssues ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => section.subsections && toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {section.subsections && (
                            <ChevronRight 
                              className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform flex-shrink-0 ${
                                expandedSections[section.id] ? 'rotate-90' : ''
                              }`}
                            />
                          )}
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {getRiskBadge(section.riskLevel)}
                          {section.hasIssues && (
                            <FileWarning className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      
                      {section.subsections && expandedSections[section.id] && (
                        <div className="ml-4 sm:ml-6 md:ml-8 mt-2 space-y-2">
                          {section.subsections.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded border border-gray-100 bg-gray-50"
                            >
                              <span className="text-gray-700 text-xs sm:text-sm truncate flex-1 mr-2" title={sub.fullClause.clause_text}>
                                {sub.title}
                              </span>
                              <div className="flex items-center gap-1">
                                {getRiskBadge(sub.riskLevel)}
                                <span className="text-xs text-gray-500">
                                  {Math.round(sub.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* AI Highlights */}
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                    AI Highlights
                  </h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {aiHighlights.slice(0, 5).map((highlight) => {
                      const Icon = highlight.icon;
                      return (
                        <div
                          key={highlight.id}
                          className={`p-3 sm:p-4 rounded-lg border ${
                            highlight.type === 'critical' 
                              ? 'border-red-200 bg-red-50' 
                              : highlight.type === 'warning'
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-green-200 bg-green-50'
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                              highlight.type === 'critical' 
                                ? 'text-red-600' 
                                : highlight.type === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{highlight.message}</p>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">{highlight.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Risk Score Summary - Better for laptop screens */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6 lg:p-8">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                    Risk Assessment
                  </h2>
                  
                  {/* Circular Progress - Improved for laptop */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 mb-6 lg:mb-8">
                    <div className="flex justify-center lg:justify-start mb-4 lg:mb-0">
                      <div className="relative">
                        {/* Background circle */}
                        <svg className="w-32 h-32 lg:w-40 lg:h-40 transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            stroke="currentColor" 
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          {/* Progress circle */}
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            stroke="currentColor" 
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - riskScores.overall / 100)}`}
                            className={`transition-all duration-1000 ease-out ${
                              riskScores.overall >= 80 ? 'text-green-500' :
                              riskScores.overall >= 60 ? 'text-yellow-500' : 'text-red-500'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl lg:text-4xl font-bold text-gray-900">{riskScores.overall}</span>
                          <span className="text-sm lg:text-base text-gray-500 font-medium">Score</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary stats for laptop */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 lg:flex-1">
                      <div className="text-center lg:text-left p-3 lg:p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl lg:text-2xl font-bold text-gray-900">{analysisResults.num_clauses}</div>
                        <div className="text-sm lg:text-base text-gray-600">Total Clauses</div>
                      </div>
                      <div className="text-center lg:text-left p-3 lg:p-4 bg-red-50 rounded-lg">
                        <div className="text-xl lg:text-2xl font-bold text-red-600">{analysisResults.total_flagged}</div>
                        <div className="text-sm lg:text-base text-gray-600">Issues Found</div>
                      </div>
                      <div className="text-center lg:text-left p-3 lg:p-4 bg-green-50 rounded-lg lg:col-span-1 col-span-2">
                        <div className="text-xl lg:text-2xl font-bold text-green-600">
                          {analysisResults.num_clauses - analysisResults.total_flagged}
                        </div>
                        <div className="text-sm lg:text-base text-gray-600">Compliant Clauses</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category breakdown - Enhanced for laptop */}
                  <div className="space-y-3 lg:space-y-4">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">Category Breakdown</h3>
                    {riskScores.categories.map((category) => (
                      <div key={category.name} className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-4 lg:w-5 flex-shrink-0">
                          <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${
                            category.status === 'good' ? 'bg-green-500' :
                            category.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <span className="text-sm lg:text-base font-medium text-gray-700 min-w-0 flex-1">{category.name}</span>
                        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                          <div className="w-20 lg:w-28 bg-gray-200 rounded-full h-2 lg:h-2.5">
                            <div 
                              className={`h-2 lg:h-2.5 rounded-full transition-all duration-500 ${
                                category.status === 'good' ? 'bg-green-500' :
                                category.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${category.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm lg:text-base font-semibold text-gray-900 w-8 lg:w-10 text-right">
                            {category.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Analysis View - Responsive */}
          {analysisResults && activeTab === 'risks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Risk Categories */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                    Detailed Risk Analysis
                  </h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {riskAnalysis.map((category, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{category.title}</h3>
                        <div className="space-y-2">
                          {category.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm text-gray-700 flex-1 min-w-0 truncate" title={item.reasoning}>
                                {item.text}
                              </span>
                              <div className="flex-shrink-0">
                                {getRiskBadge(item.level)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Risk Summary Card */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Risk Summary</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">{analysisResults.total_flagged}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Critical</span>
                        <span className="font-semibold text-red-600 text-sm">{riskCounts.critical}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">High</span>
                        <span className="font-semibold text-orange-600 text-sm">{riskCounts.high}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Medium</span>
                        <span className="font-semibold text-yellow-600 text-sm">{riskCounts.medium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Low</span>
                        <span className="font-semibold text-green-600 text-sm">{riskCounts.low}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Actions</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <button 
                      onClick={downloadAnalysisReport}
                      disabled={isDownloading}
                      className="w-full text-left p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                          {isDownloading ? 'Generating...' : 'Download Analysis Report'}
                        </span>
                        {isDownloading ? (
                          <Loader className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={exportToExcel}
                      disabled={isDownloading}
                      className="w-full text-left p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                          {isDownloading ? 'Exporting...' : 'Export to Excel'}
                        </span>
                        {isDownloading ? (
                          <Loader className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details View - Detailed clause analysis */}
          {analysisResults && activeTab === 'details' && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                  Detailed Clause Analysis
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={downloadAnalysisReport}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        Export Results
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {analysisResults.results.map((clause, index) => (
                  <div key={index} className={`p-3 sm:p-4 border-l-4 rounded-lg ${
                    clause.risk_status === 'OK' 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-red-400 bg-red-50'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Clause {index + 1} - {clause.clause_type}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(clause.risk_status === 'OK' ? 'low' : 'high')}
                        <span className="text-xs text-gray-500">
                          {Math.round(clause.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none mb-3">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border">
                        {clause.clause_text}
                      </p>
                    </div>
                    
                    {clause.reasoning && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">AI Analysis:</h4>
                        <p className="text-blue-800 text-xs sm:text-sm">{clause.reasoning}</p>
                      </div>
                    )}
                    
                    {clause.risk_guidance && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 text-sm mb-2">Recommendation:</h4>
                        <p className="text-yellow-800 text-xs sm:text-sm">{clause.risk_guidance}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ContractAnalyzer;