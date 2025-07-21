import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, X, Info, Shield, BarChart } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ClauseValidationInterface = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('analysis');

  // Mock data based on the requirements
  const analysisData = {
    extractedClauses: [
      { id: 1, name: 'Definitions', status: 'compliant', farReference: 'FAR 2.101' },
      { id: 2, name: 'Scope of Work', status: 'compliant', farReference: 'FAR 37.102' },
      { id: 3, name: 'Non-Disclosure', status: 'compliant', farReference: 'FAR 52.204-2' },
      { id: 4, name: 'Payment Terms', status: 'compliant', farReference: 'FAR 32.111' },
      { id: 5, name: 'Data Rights', status: 'warning', farReference: 'DFARS 252.227-7013' },
      { id: 6, name: 'Indemnification', status: 'compliant', farReference: 'FAR 28.306' },
      { id: 7, name: 'Dispute Resolution', status: 'compliant', farReference: 'FAR 33.201' },
      { id: 8, name: 'Termination for Convenience', status: 'missing', farReference: 'FAR 52.249-2' },
      { id: 9, name: 'Governing Law', status: 'compliant', farReference: 'FAR 52.232-1' },
      { id: 10, name: 'Notice Provisions', status: 'compliant', farReference: 'FAR 52.243-1' },
    
    ],
    aiAnalysis: [
      {
        type: 'error',
        title: 'Missing Required Termination Clause',
        reference: 'FAR 52.249-2',
        description: 'Termination for Convenience of the Government clause is mandatory for all government contracts exceeding $10,000. This clause must be included to ensure compliance with federal acquisition regulations.',
        confidence: 95,
        severity: 'critical'
      },
      {
        type: 'error',
        title: 'Buy American Act Compliance Missing',
        reference: 'FAR 52.225-1',
        description: 'Buy American Act provisions are required for contracts involving the purchase of supplies. The current contract lacks necessary compliance language.',
        confidence: 88,
        severity: 'critical'
      },
      {
        type: 'warning',
        title: 'Data Rights Clause Deviation',
        reference: 'DFARS 252.227-7013',
        description: 'Current data rights provisions may not fully align with DFARS requirements for technical data and computer software rights. Review recommended to ensure proper government rights.',
        confidence: 72,
        severity: 'moderate'
      },
      {
        type: 'warning',
        title: 'Security Requirements Incomplete',
        reference: 'DFARS 252.204-7012',
        description: 'Safeguarding of Covered Defense Information and Cyber Incident Reporting requirements appear incomplete. Additional security provisions may be needed.',
        confidence: 68,
        severity: 'moderate'
      }
    ],
    ruleScore: 65,
    llmScore: 72,
    confidenceScore: 85,
    reasoning: 'Analysis identified critical missing clauses and potential regulatory misalignments. Rule-based validation flagged mandatory FAR/DFARS requirements while LLM analysis provided contextual compliance assessment.',
    complianceStats: {
      farCompliance: 75,
      dfarsCompliance: 60,
      totalClauses: 12,
      compliantClauses: 8,
      warningClauses: 2,
      missingClauses: 2
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 4000);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsAnalyzing(false);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'occ-blue bg-occ-secondary-gray';
      case 'warning': return 'occ-secondary-orange bg-occ-yellow';
      case 'missing': return 'occ-secondary-orange bg-occ-secondary-orange';
      default: return 'occ-gray bg-occ-secondary-gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'missing': return <X className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-occ-secondary-orange occ-secondary-white';
      case 'moderate':
        return 'bg-occ-yellow occ-blue-dark';
      default:
        return 'bg-occ-secondary-gray occ-blue-dark';
    }
  };

  return (
    <MainLayout title="Clause Checker" userRole="Legal Reviewer">
      <div className="min-h-screen  pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 occ-secondary-white flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">Clause Checker</h1>
            </div>
            <p className="occ-secondary-white opacity-90 text-sm sm:text-base">FAR/DFARS Compliance Analysis & Validation</p>
          </div>

          {!uploadedFile && (
            <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-occ-gray rounded-xl p-6 sm:p-8 lg:p-12 hover:border-occ-blue transition-all duration-300 hover:bg-occ-secondary-gray">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 occ-gray mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium occ-blue-dark mb-2">Upload Contract Draft</h3>
                  <p className="occ-gray mb-3 sm:mb-4 text-sm sm:text-base px-2">Upload your PDF contract for comprehensive clause validation analysis</p>
                  <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-occ-blue occ-secondary-white rounded-lg cursor-pointer hover:bg-occ-blue-dark transition-all shadow-md text-sm sm:text-base">
                    <FileText className="w-4 h-4 mr-2" />
                    Select Contract File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs occ-gray mt-2">Supported formats: PDF, Word documents (up to 50MB)</p>
                </div>
              </div>
            </div>
          )}

          {uploadedFile && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="xl:col-span-1 bg-occ-secondary-white rounded-xl shadow-lg border border-occ-secondary-gray">
                <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white mr-2 flex-shrink-0" />
                      <span className="font-medium occ-secondary-white truncate text-sm sm:text-base">{uploadedFile.name}</span>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-occ-blue-dark rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4 occ-secondary-white" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium occ-blue-dark mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <BarChart className="w-4 h-4 occ-blue" />
                    Extracted Clause Structure
                  </h3>
                  
                  {isAnalyzing ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-3/4 mb-2"></div>
                          <div className="h-2 sm:h-3 bg-occ-secondary-gray rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {analysisData.extractedClauses.map((clause, index) => (
                        <div key={clause.id} className="flex items-center justify-between py-2 sm:py-3 px-2 sm:px-3 rounded-lg hover:bg-occ-secondary-gray transition-all border border-occ-secondary-gray">
                          <div className="flex items-center min-w-0 flex-1">
                            <span className="text-xs sm:text-sm occ-gray mr-2 sm:mr-3 flex-shrink-0">{index + 1}.</span>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs sm:text-sm occ-blue-dark font-medium block truncate">{clause.name}</span>
                              <span className="text-xs occ-gray">{clause.farReference}</span>
                            </div>
                          </div>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(clause.status)} ml-2 flex-shrink-0`}>
                            {getStatusIcon(clause.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary Stats -*/}
                  {!isAnalyzing && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                      <h4 className="text-xs sm:text-sm font-medium occ-blue-dark mb-2 sm:mb-3">Compliance Summary</h4>
                      <div className="space-y-1 sm:space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="occ-gray">Total Clauses:</span>
                          <span className="occ-blue-dark font-medium">{analysisData.complianceStats.totalClauses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="occ-gray">Compliant:</span>
                          <span className="occ-blue font-medium">{analysisData.complianceStats.compliantClauses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="occ-gray">Warnings:</span>
                          <span className="occ-secondary-orange font-medium">{analysisData.complianceStats.warningClauses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="occ-gray">Missing:</span>
                          <span className="occ-secondary-orange font-medium">{analysisData.complianceStats.missingClauses}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - AI Analysis -  */}
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                {/* AI Analysis Issues -  */}
                <div className="bg-occ-secondary-white rounded-xl shadow-lg border border-occ-secondary-gray">
                  <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue-dark">
                    <h3 className="font-medium occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                      AI Compliance Analysis
                    </h3>
                                    </div>
                  
                  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {isAnalyzing ? (
                      <div className="animate-pulse space-y-3 sm:space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="space-y-2 sm:space-y-3">
                            <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-full"></div>
                            <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-4/5"></div>
                            <div className="h-2 sm:h-3 bg-occ-secondary-gray rounded w-3/5"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      analysisData.aiAnalysis.map((issue, index) => (
                        <div key={index} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                          issue.type === 'error' ? 'border-occ-secondary-orange bg-occ-secondary-gray' : 'border-occ-yellow bg-occ-secondary-gray'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className={`flex items-center gap-2 sm:gap-3 ${issue.type === 'error' ? 'occ-secondary-orange' : 'occ-secondary-orange'}`}>
                              {issue.type === 'error' ? <X className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                              <h4 className="font-medium occ-blue-dark text-sm sm:text-base">{issue.title}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityBadge(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-occ-blue occ-secondary-white font-medium">
                                {issue.reference}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm occ-gray mt-2 leading-relaxed">{issue.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
                            <span className="text-xs occ-gray">Confidence:</span>
                            <div className="flex items-center gap-2 flex-1 sm:max-w-32">
                              <div className="flex-1 bg-occ-secondary-gray rounded-full h-2">
                                <div 
                                  className="bg-occ-blue h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${issue.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-xs occ-blue-dark font-medium">{issue.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Scoring Section -  */}
                <div className="bg-occ-secondary-white rounded-xl shadow-lg border border-occ-secondary-gray">
                  <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue">
                    <h3 className="font-medium occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                      <BarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Rule + LLM Hybrid Scoring
                    </h3>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    {isAnalyzing ? (
                      <div className="animate-pulse space-y-3 sm:space-y-4">
                        <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-1/2"></div>
                        <div className="h-6 sm:h-8 bg-occ-secondary-gray rounded"></div>
                        <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-1/2"></div>
                        <div className="h-6 sm:h-8 bg-occ-secondary-gray rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Rule Score */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                            <span className="text-xs sm:text-sm font-medium occ-blue-dark">Rule-Based Validation</span>
                            <span className="text-base sm:text-lg font-bold occ-secondary-orange">{analysisData.ruleScore}/100</span>
                          </div>
                          <div className="w-full bg-occ-secondary-gray rounded-full h-2 sm:h-3 border border-occ-secondary-gray">
                            <div 
                              className="bg-occ-secondary-orange h-2 sm:h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${analysisData.ruleScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs occ-gray mt-1">FAR/DFARS mandatory requirements compliance</p>
                        </div>

                        {/* LLM Score */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                            <span className="text-xs sm:text-sm font-medium occ-blue-dark">LLM Reasoning Score</span>
                            <span className="text-base sm:text-lg font-bold occ-blue">{analysisData.llmScore}/100</span>
                          </div>
                          <div className="w-full bg-occ-secondary-gray rounded-full h-2 sm:h-3 border border-occ-secondary-gray">
                            <div 
                              className="bg-occ-blue h-2 sm:h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${analysisData.llmScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs occ-gray mt-1">Contextual analysis and interpretation</p>
                        </div>

                        {/* Overall Confidence */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                            <span className="text-xs sm:text-sm font-medium occ-blue-dark">Overall Confidence</span>
                            <span className="text-base sm:text-lg font-bold occ-blue-dark">{analysisData.confidenceScore}/100</span>
                          </div>
                          <div className="w-full bg-occ-secondary-gray rounded-full h-2 sm:h-3 border border-occ-secondary-gray">
                            <div 
                              className="bg-occ-blue-dark h-2 sm:h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${analysisData.confidenceScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs occ-gray mt-1">Analysis reliability and accuracy</p>
                        </div>

                        {/* Compliance Breakdown -  Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-occ-secondary-gray">
                          <div className="text-center p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                            <div className="text-xl sm:text-2xl font-bold occ-blue mb-1">{analysisData.complianceStats.farCompliance}%</div>
                            <div className="text-xs occ-gray">FAR Compliance</div>
                          </div>
                          <div className="text-center p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                            <div className="text-xl sm:text-2xl font-bold occ-secondary-blue mb-1">{analysisData.complianceStats.dfarsCompliance}%</div>
                            <div className="text-xs occ-gray">DFARS Compliance</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Reasoning -  */}
                <div className="bg-occ-secondary-white rounded-xl shadow-lg border border-occ-secondary-gray">
                  <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue-dark">
                    <h3 className="font-medium occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      Analysis Reasoning
                    </h3>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    {isAnalyzing ? (
                      <div className="animate-pulse space-y-2 sm:space-y-3">
                        <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-full"></div>
                        <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-5/6"></div>
                        <div className="h-3 sm:h-4 bg-occ-secondary-gray rounded w-4/6"></div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                          <h4 className="text-xs sm:text-sm font-medium occ-blue-dark mb-2">AI Analysis Summary</h4>
                          <p className="text-xs sm:text-sm occ-gray leading-relaxed">{analysisData.reasoning}</p>
                        </div>
                        
                        {/* Stats Grid -  */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          <div className="p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                            <div className="flex items-center gap-2 mb-1">
                              <X className="w-4 h-4 occ-secondary-orange flex-shrink-0" />
                              <span className="font-medium occ-blue-dark text-xs sm:text-sm">Critical Issues</span>
                            </div>
                            <p className="occ-secondary-orange font-bold text-base sm:text-lg">2</p>
                            <p className="text-xs occ-gray">Missing mandatory clauses</p>
                          </div>
                          <div className="p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4 occ-secondary-orange flex-shrink-0" />
                              <span className="font-medium occ-blue-dark text-xs sm:text-sm">Warnings</span>
                            </div>
                            <p className="occ-secondary-orange font-bold text-base sm:text-lg">2</p>
                            <p className="text-xs occ-gray">Potential misalignments</p>
                          </div>
                          <div className="p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 occ-blue flex-shrink-0" />
                              <span className="font-medium occ-blue-dark text-xs sm:text-sm">Compliant</span>
                            </div>
                            <p className="occ-blue font-bold text-base sm:text-lg">8</p>
                            <p className="text-xs occ-gray">Properly implemented</p>
                          </div>
                        </div>

                        {/* Recommendations -  */}
                        <div className="p-3 sm:p-4 bg-occ-yellow rounded-lg border-2 border-occ-yellow">
                          <h4 className="text-xs sm:text-sm font-medium occ-blue-dark mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            Recommendations
                          </h4>
                          <ul className="text-xs sm:text-sm occ-blue-dark space-y-1 leading-relaxed">
                            <li>• Add FAR 52.249-2 Termination for Convenience clause</li>
                            <li>• Include Buy American Act provisions (FAR 52.225-1)</li>
                            <li>• Review and align data rights with DFARS requirements</li>
                            <li>• Enhance security provisions per DFARS 252.204-7012</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClauseValidationInterface;