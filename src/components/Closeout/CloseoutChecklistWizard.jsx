import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Download, FileText, RefreshCw, ChevronRight, Info, Clock, CheckCircle, X, Target, BarChart3 } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

// Properly access the environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://3.95.95.62:8006';
const CLOSEOUT_API_ENDPOINT = `${API_BASE_URL}/api/closeout_report`;

const CloseoutChecklistWizard = () => {
  const [checklist, setChecklist] = useState([]);
  const [aiChecks, setAiChecks] = useState([]);
  const [validationData, setValidationData] = useState(null);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  
  // Individual component loading and error states
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistError, setChecklistError] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [aiChecksError, setAiChecksError] = useState(null);
  const [reportError, setReportError] = useState(null);

  // Fetch default checklist on component mount
  useEffect(() => {
    fetchDefaultChecklist();
  }, []);

  // Validate checklist whenever it changes
  useEffect(() => {
    if (checklist.length > 0) {
      validateChecklist();
    }
  }, [checklist, aiChecks]);

  const fetchDefaultChecklist = async () => {
    try {
      setChecklistLoading(true);
      setChecklistError(null);
      
      const response = await fetch(`${CLOSEOUT_API_ENDPOINT}/checklist/default`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch checklist: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setChecklist(data.checklist || []);
    } catch (err) {
      console.error('Error fetching default checklist:', err);
      setChecklistError(`Failed to load checklist: ${err.message}`);
    } finally {
      setChecklistLoading(false);
    }
  };

  const validateChecklist = async () => {
    try {
      setValidationLoading(true);
      setValidationError(null);
      
      const payload = {
        checklist: checklist,
        ai_checks: aiChecks
      };

      const response = await fetch(`${CLOSEOUT_API_ENDPOINT}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${errorData.detail?.[0]?.msg || 'Invalid data'}`);
        }
        throw new Error(`Validation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setValidationData(data);
    } catch (err) {
      console.error('Error validating checklist:', err);
      setValidationError(`Validation failed: ${err.message}`);
    } finally {
      setValidationLoading(false);
    }
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const runAIChecks = async () => {
    setIsRunningChecks(true);
    setAiChecksError(null);
    
    try {
      // Since AI checks come from validation, we'll trigger validation
      await validateChecklist();
    } catch (err) {
      console.error('Error running AI checks:', err);
      setAiChecksError(`AI checks failed: ${err.message}`);
    } finally {
      setIsRunningChecks(false);
    }
  };

  const generateCloseoutReport = async () => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);
      
      const payload = {
        checklist: checklist,
        ai_checks: aiChecks
      };

      const response = await fetch(`${CLOSEOUT_API_ENDPOINT}/report/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Report generation error: ${errorData.detail?.[0]?.msg || 'Invalid data'}`);
        }
        throw new Error(`Report generation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle the PDF response - API returns a string
      if (typeof data === 'string') {
        // If it's a base64 data URL
        if (data.startsWith('data:application/pdf')) {
          const link = document.createElement('a');
          link.href = data;
          link.download = `closeout-report-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } 
        // If it's a regular URL
        else if (data.startsWith('http')) {
          window.open(data, '_blank');
        }
        // If it's base64 without data URL prefix
        else {
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${data}`;
          link.download = `closeout-report-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
    } catch (err) {
      console.error('Error generating report:', err);
      setReportError(`Report generation failed: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const completeCloseout = () => {
    if (validationData?.ready_for_closeout) {
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 3000);
    }
  };

  const getAICheckIcon = (type) => {
    switch (type) {
      case 'error': return <X className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAICheckColor = (type) => {
    switch (type) {
      case 'error': return 'occ-secondary-orange bg-occ-secondary-orange border-occ-secondary-orange';
      case 'warning': return 'occ-secondary-orange bg-occ-yellow border-occ-yellow';
      case 'info': return 'occ-blue bg-occ-secondary-gray border-occ-blue';
      default: return 'occ-gray bg-occ-secondary-gray border-occ-gray';
    }
  };

  // Calculate local values for display when API data is not available
  const completedItems = checklist.filter(item => item.checked).length;
  const requiredItems = checklist.filter(item => item.required);
  const completedRequiredItems = requiredItems.filter(item => item.checked).length;
  const completionPercentage = validationData 
    ? Math.round((validationData.completed_items / validationData.total_items) * 100)
    : checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;
  
  const canComplete = validationData 
    ? validationData.ready_for_closeout 
    : requiredItems.every(item => item.checked) && aiChecks.filter(check => check.type === 'error').length === 0;

  return (
    <MainLayout title="Closeout Wizard" userRole="Closeout Wizard">
      <div className="min-h-screen pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="p-2 bg-occ-secondary-white rounded-lg flex-shrink-0">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 occ-blue" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">Closeout Checklist Wizard</h1>
                  <p className="occ-secondary-white opacity-90 text-xs sm:text-sm lg:text-base">Complete all required items before contract closeout</p>
                </div>
              </div>
              <button
                onClick={completeCloseout}
                disabled={!canComplete}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all shadow-md text-sm sm:text-base ${
                  canComplete 
                    ? 'bg-occ-secondary-white occ-blue hover:bg-occ-secondary-gray' 
                    : 'bg-occ-gray occ-secondary-white cursor-not-allowed opacity-50'
                }`}
              >
                Complete Closeout
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray mb-4 sm:mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                <h2 className="text-base sm:text-lg font-semibold occ-secondary-white">Progress Overview</h2>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {validationError && (
                <div className="bg-occ-secondary-orange occ-secondary-white p-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{validationError}</span>
                  <button 
                    onClick={() => setValidationError(null)}
                    className="ml-auto p-1 hover:bg-occ-secondary-white hover:occ-secondary-orange rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <span className="text-sm font-medium occ-blue-dark">Overall Progress</span>
                <span className="text-lg sm:text-xl font-bold occ-blue">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-occ-secondary-gray rounded-full h-2 sm:h-3 mb-4 sm:mb-6 border border-occ-secondary-gray">
                <div 
                  className="bg-occ-blue h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                  <div className="text-xl sm:text-2xl font-bold occ-blue-dark">
                    {validationData ? `${validationData.completed_items}/${validationData.total_items}` : `${completedItems}/${checklist.length}`}
                  </div>
                  <div className="text-xs sm:text-sm occ-gray">Total Items</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                  <div className="text-xl sm:text-2xl font-bold occ-blue">
                    {validationData ? `${validationData.completed_required_items}/${validationData.required_items}` : `${completedRequiredItems}/${requiredItems.length}`}
                  </div>
                  <div className="text-xs sm:text-sm occ-gray">Required Items</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                  <div className="text-xl sm:text-2xl font-bold occ-secondary-orange">
                    {validationData ? validationData.ai_issues : aiChecks.filter(check => check.status === 'pending').length}
                  </div>
                  <div className="text-xs sm:text-sm occ-gray">AI Issues</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Checklist */}
            <div className="xl:col-span-2 bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
              <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
                <h2 className="text-base sm:text-lg font-semibold occ-secondary-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Closeout Checklist
                </h2>
              </div>
              
              <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                {checklistLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin occ-blue mr-3" />
                    <span className="occ-gray">Loading checklist...</span>
                  </div>
                ) : checklistError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 occ-secondary-orange" />
                    <p className="occ-gray text-sm mb-3">{checklistError}</p>
                    <button
                      onClick={fetchDefaultChecklist}
                      className="px-4 py-2 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-colors text-sm"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : checklist.length > 0 ? (
                  checklist.map(item => (
                    <div key={item.id} className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-occ-secondary-gray transition-all duration-200 border-2 border-transparent hover:border-occ-blue">
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm flex-shrink-0 ${
                          item.checked
                            ? 'bg-occ-blue border-occ-blue occ-secondary-white'
                            : 'border-occ-gray hover:border-occ-blue bg-occ-secondary-white'
                        }`}
                      >
                        {item.checked && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <label 
                          className={`text-xs sm:text-sm cursor-pointer transition-all duration-200 font-medium block ${
                            item.checked ? 'occ-gray line-through' : 'occ-blue-dark group-hover:occ-blue'
                          }`}
                          onClick={() => toggleChecklistItem(item.id)}
                        >
                          {item.text}
                        </label>
                        {item.required && (
                          <span className="inline-block mt-1 text-xs occ-secondary-white font-medium px-2 py-0.5 bg-occ-secondary-orange rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                        item.checked 
                          ? 'bg-occ-blue occ-secondary-white' 
                          : 'bg-occ-secondary-gray occ-gray'
                      }`}>
                        {item.checked ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 mx-auto mb-3 occ-gray" />
                    <p className="occ-gray text-sm">No checklist items available</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Auto-checks & Actions */}           
            <div className="space-y-4 sm:space-y-6">
              {/* AI Auto-checks */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue-dark">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      AI Auto-checks
                    </h3>
                    <button
                      onClick={runAIChecks}
                      disabled={isRunningChecks || checklist.length === 0}
                      className="p-1.5 sm:p-2 occ-secondary-white hover:bg-occ-blue rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRunningChecks ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  {aiChecksError && (
                    <div className="bg-occ-secondary-orange occ-secondary-white p-3 rounded-lg mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{aiChecksError}</span>
                      <button 
                        onClick={() => setAiChecksError(null)}
                        className="ml-auto p-1 hover:bg-occ-secondary-white hover:occ-secondary-orange rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {isRunningChecks ? (
                    <div className="flex items-center gap-2 sm:gap-3 occ-blue p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-blue">
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Running AI analysis...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {aiChecks.length > 0 ? (
                        aiChecks.map(check => (
                          <div key={check.id} className={`p-3 sm:p-4 rounded-lg border-2 ${getAICheckColor(check.type)}`}>
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getAICheckIcon(check.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm mb-1">{check.title}</div>
                                <div className="text-xs opacity-90 leading-relaxed">{check.description}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 sm:py-6">
                          <div className="p-2 sm:p-3 bg-occ-blue rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 occ-secondary-white" />
                          </div>
                          <div className="text-xs sm:text-sm occ-blue-dark font-medium">No issues detected</div>
                          <div className="text-xs occ-gray">All systems check passed</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Panel */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-3 sm:p-4 border-b-2 border-occ-secondary-gray bg-occ-blue">
                  <h3 className="font-medium occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Actions
                  </h3>
                </div>
                
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {reportError && (
                    <div className="bg-occ-secondary-orange occ-secondary-white p-3 rounded-lg mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{reportError}</span>
                      <button 
                        onClick={() => setReportError(null)}
                        className="ml-auto p-1 hover:bg-occ-secondary-white hover:occ-secondary-orange rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={generateCloseoutReport}
                    disabled={isGeneratingReport || checklist.length === 0}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all font-medium shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Gen...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Generate Closeout Report</span>
                        <span className="sm:hidden">Generate Report</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    disabled={checklist.length === 0}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 occ-blue border-2 border-occ-blue rounded-lg hover:bg-occ-blue hover:occ-secondary-white transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Print Checklist</span>
                    <span className="sm:hidden">Print</span>
                  </button>
                </div>

                {/* Status Summary */}
                <div className="p-3 sm:p-4 border-t-2 border-occ-secondary-gray bg-occ-secondary-gray">
                  <h4 className="text-xs sm:text-sm font-medium occ-blue-dark mb-2 sm:mb-3">Status Summary</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs occ-gray">Completion:</span>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-12 sm:w-16 bg-occ-secondary-white rounded-full h-1.5 sm:h-2 border border-occ-secondary-gray">
                          <div 
                            className="bg-occ-blue h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium occ-blue-dark">{completionPercentage}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs occ-gray">Required Items:</span>
                      <span className={`text-xs font-medium ${
                        validationData 
                          ? (validationData.completed_required_items === validationData.required_items ? 'occ-blue' : 'occ-secondary-orange')
                          : (completedRequiredItems === requiredItems.length ? 'occ-blue' : 'occ-secondary-orange')
                      }`}>
                        {validationData 
                          ? `${validationData.completed_required_items}/${validationData.required_items}`
                          : `${completedRequiredItems}/${requiredItems.length}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs occ-gray">AI Issues:</span>
                      <span className={`text-xs font-medium ${
                        validationData 
                          ? (validationData.ai_issues === 0 ? 'occ-blue' : 'occ-secondary-orange')
                          : (aiChecks.filter(check => check.status === 'pending').length === 0 ? 'occ-blue' : 'occ-secondary-orange')
                      }`}>
                        {validationData 
                          ? validationData.ai_issues
                          : aiChecks.filter(check => check.status === 'pending').length
                        }
                      </span>
                    </div>
                  </div>

                  {/* Readiness Indicator */}
                  <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-occ-secondary-white">
                    <div className={`p-2 sm:p-3 rounded-lg text-center ${
                      canComplete 
                        ? 'bg-occ-blue occ-secondary-white' 
                        : 'bg-occ-secondary-orange occ-secondary-white'
                    }`}>
                      <div className="text-xs sm:text-sm font-medium">
                        {canComplete ? 'Ready for Closeout' : 'Not Ready'}
                      </div>
                      <div className="text-xs opacity-90">
                        {canComplete 
                          ? 'All requirements met' 
                          : validationData
                            ? `${validationData.required_items - validationData.completed_required_items} items pending`
                            : `${requiredItems.length - completedRequiredItems} items pending`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-occ-secondary-white p-2 sm:p-3 rounded-lg shadow-md border border-occ-secondary-gray">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-0.5 sm:p-1 bg-occ-blue rounded flex-shrink-0">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 occ-secondary-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold occ-blue-dark">
                        {validationData ? validationData.pending_items : (checklist.length - completedItems)}
                      </div>
                      <div className="text-xs occ-gray">Remaining</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-occ-secondary-white p-2 sm:p-3 rounded-lg shadow-md border border-occ-secondary-gray">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-0.5 sm:p-1 bg-occ-secondary-orange rounded flex-shrink-0">
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 occ-secondary-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold occ-blue-dark">
                        {aiChecks.filter(check => check.type === 'warning' || check.type === 'error').length}
                      </div>
                      <div className="text-xs occ-gray">Issues</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Modal */}
          {showComplete && (
            <div className="fixed inset-0 bg-occ-secondary-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-occ-secondary-white rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 border-2 border-occ-blue mx-4">
                <div className="text-center">
                  <div className="p-3 sm:p-4 bg-occ-blue rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 occ-secondary-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold occ-blue-dark mb-2">Closeout Complete!</h3>
                  <p className="text-xs sm:text-sm occ-gray mb-3 sm:mb-4 leading-relaxed">Contract has been successfully closed out and all requirements have been met.</p>
                  <div className="p-2 sm:p-3 bg-occ-secondary-gray rounded-lg border border-occ-blue">
                    <div className="text-xs occ-blue-dark space-y-1">
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-medium">100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium occ-blue">Closed</span>
                      </div>
                    </div>
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

export default CloseoutChecklistWizard;