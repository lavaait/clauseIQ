import React, { useState, useEffect } from 'react';
import { Download, Check, ChevronDown, FileText, Settings, RefreshCw, CheckCircle, BarChart3, Target, AlertTriangle } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

  // API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ChecklistGenerator = () => {
  const [contractType, setContractType] = useState('Firm-Fixed-Price');
  const [agencyPolicy, setAgencyPolicy] = useState('Agency A');
  const [checklist, setChecklist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);


  

  const contractTypes = ['Firm-Fixed-Price', 'Cost-Plus-Fixed-Fee', 'Time-and-Materials'];
  const agencies = ['Agency A', 'Agency B', 'Agency C'];

  // API service functions
  const fetchChecklist = async (contractType, agencyPolicy) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/checklist_validation/checklist_validation?contract_type=${encodeURIComponent(contractType)}&agency_policy=${encodeURIComponent(agencyPolicy)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation Error: ${errorData.detail?.[0]?.msg || 'Invalid parameters'}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching checklist:', error);
      throw error;
    }
  };

  const downloadChecklistPDF = async (contractType, agencyPolicy) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/checklist_validation/checklist/pdf?contract_type=${encodeURIComponent(contractType)}&agency_policy=${encodeURIComponent(agencyPolicy)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation Error: ${errorData.detail?.[0]?.msg || 'Invalid parameters'}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF content as blob
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  };

  useEffect(() => {
    generateChecklist();
  }, [contractType, agencyPolicy]);

  const generateChecklist = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data = await fetchChecklist(contractType, agencyPolicy);
      setApiResponse(data);
      setChecklist(data.items || []);
    } catch (error) {
      setError(`Failed to fetch checklist: ${error.message}`);
      setChecklist([]);
      setApiResponse(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const generatePDF = async () => {
    setIsDownloadingPDF(true);
    setError(null);

    try {
      const blob = await downloadChecklistPDF(contractType, agencyPolicy);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-checklist-${contractType.toLowerCase().replace(/\s+/g, '-')}-${agencyPolicy.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Failed to download PDF: ${error.message}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const generateTextFile = () => {
    const checklistText = checklist.map((item, index) => 
      `${index + 1}. [${item.checked ? 'X' : ' '}] ${item.text}`
    ).join('\n');

    const content = `Compliance Checklist
Contract Type: ${contractType}
Agency Policy: ${agencyPolicy}
Generated: ${new Date().toLocaleDateString()}
API Source: ${API_BASE_URL}

${checklistText}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-checklist-${contractType.toLowerCase().replace(/\s+/g, '-')}-${agencyPolicy.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/docs`);
      if (response.ok) {
        console.log('API connection successful');
      }
    } catch (error) {
      console.error('API connection failed:', error);
    }
  };

  // Test API connection on component mount
  useEffect(() => {
    testAPIConnection();
  }, []);

  const completedItems = checklist.filter(item => item.checked).length;
  const completionPercentage = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

  return (
      <div className="min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Modern Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-6 sm:p-8 mb-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-occ-secondary-white rounded-lg">
                  <Target className="w-8 h-8 occ-blue" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold occ-secondary-white">Compliance Checklist Generator</h1>
                  <p className="occ-secondary-white opacity-90 text-sm sm:text-base">Generate tailored compliance checklists for contract types and agency policies</p>
                  
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={generateChecklist}
                  className="px-4 py-2 bg-occ-secondary-white occ-blue rounded-lg hover:bg-occ-secondary-gray transition-all shadow-md flex items-center gap-2 font-medium"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-occ-secondary-orange rounded-lg border border-occ-secondary-orange">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 occ-secondary-white" />
                <span className="text-sm font-medium occ-secondary-white">{error}</span>
              </div>
            </div>
          )}

          {/* Modern Configuration Form */}
          <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 occ-blue" />
              <h2 className="text-lg font-semibold occ-blue-dark">Configuration Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium occ-blue-dark mb-3">
                  Contract Type
                </label>
                <div className="relative">
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-occ-secondary-gray rounded-lg bg-occ-secondary-white occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none transition-all shadow-sm"
                    disabled={isGenerating}
                  >
                    {contractTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 occ-gray pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium occ-blue-dark mb-3">
                  Agency Policy
                </label>
                <div className="relative">
                  <select
                    value={agencyPolicy}
                    onChange={(e) => setAgencyPolicy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-occ-secondary-gray rounded-lg bg-occ-secondary-white occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none transition-all shadow-sm"
                    disabled={isGenerating}
                  >
                    {agencies.map(agency => (
                      <option key={agency} value={agency}>{agency}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 occ-gray pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modern Configuration Summary */}
            <div className="mt-6 p-4 bg-occ-secondary-gray rounded-lg border-2 border-occ-secondary-gray">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 occ-blue" />
                    <span className="text-sm font-medium occ-blue-dark">Current Configuration:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-occ-blue occ-secondary-white text-xs font-medium rounded-full">{contractType}</span>
                    <span className="px-3 py-1 bg-occ-secondary-blue occ-secondary-white text-xs font-medium rounded-full">{agencyPolicy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm occ-gray">Progress:</div>
                  <div className="text-sm font-bold occ-blue-dark">
                    {completedItems}/{checklist.length} items ({completionPercentage}%)
                  </div>
                </div>
              </div>
            </div>

            {/* API Response Info */}
            {apiResponse && (
              <div className="mt-4 p-3 bg-occ-blue rounded-lg">
                <div className="text-xs occ-secondary-white">
                  <div className="font-medium mb-1">✓ API Response Received:</div>
                  <div>Contract Type: {apiResponse.contract_type}</div>
                  <div>Agency Policy: {apiResponse.agency_policy}</div>
                  <div>Items Retrieved: {apiResponse.items?.length || 0}</div>
                  <div>API Endpoint: /api/checklist_validation/checklist_validation</div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Compliance Checklist */}
          <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray overflow-hidden">
            <div className="p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 occ-secondary-white" />
                  <h2 className="text-lg font-semibold occ-secondary-white">Compliance Checklist</h2>
                </div>
                {completionPercentage === 100 && checklist.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-occ-yellow rounded-full">
                    <Check className="w-4 h-4 occ-blue-dark" />
                    <span className="text-sm font-medium occ-blue-dark">Complete</span>
                  </div>
                )}
              </div>
              
              {/* Modern Progress Bar */}
              {checklist.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm occ-secondary-white mb-2">
                    <span>Completion Progress</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-occ-blue-dark rounded-full h-3 border border-occ-blue-dark">
                    <div 
                      className="bg-occ-yellow h-3 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 occ-blue mb-6 p-4 bg-occ-secondary-gray rounded-lg border border-occ-blue">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Fetching checklist from API: {API_BASE_URL}/api/checklist_validation/checklist_validation</span>
                  </div>
                  <div className="text-xs occ-gray mb-4">
                    Parameters: contract_type={contractType}, agency_policy={agencyPolicy}
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                      <div className="w-6 h-6 bg-occ-secondary-gray rounded-lg"></div>
                      <div className="h-4 bg-occ-secondary-gray rounded-lg flex-1"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="group flex items-center gap-4 p-4 rounded-lg hover:bg-occ-secondary-gray transition-all duration-200 border-2 border-transparent hover:border-occ-blue">
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
                          item.checked
                            ? 'bg-occ-blue border-occ-blue occ-secondary-white'
                            : 'border-occ-gray hover:border-occ-blue bg-occ-secondary-white'
                        }`}
                      >
                        {item.checked && <Check className="w-4 h-4" />}
                      </button>
                      <label 
                        className={`flex-1 text-sm cursor-pointer transition-all duration-200 font-medium ${
                          item.checked ? 'occ-gray line-through' : 'occ-blue-dark group-hover:occ-blue'
                        }`}
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        {item.text}
                      </label>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        item.checked 
                          ? 'bg-occ-blue occ-secondary-white' 
                          : 'bg-occ-secondary-gray occ-gray'
                      }`}>
                        {item.checked ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                  ))}

                  {checklist.length === 0 && !isGenerating && !error && (
                    <div className="text-center py-12">
                      <div className="p-4 bg-occ-secondary-gray rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-10 h-10 occ-gray" />
                      </div>
                      <h3 className="text-lg font-medium occ-blue-dark mb-2">No Checklist Available</h3>
                      <p className="occ-gray">No checklist items available for this configuration</p>
                      <p className="text-xs occ-gray mt-2">API: {API_BASE_URL}/api/checklist_validation/checklist_validation</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modern Action Panel */}
          {checklist.length > 0 && !isGenerating && (
            <div className="mt-6 bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue rounded-lg">
                    <Download className="w-5 h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium occ-blue-dark">Export Options</h3>
                    <p className="text-xs occ-gray">Ready to export your compliance checklist for audit or submission</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 occ-blue border-2 border-occ-blue rounded-lg hover:bg-occ-blue hover:occ-secondary-white transition-all font-medium shadow-sm"
                  >
                    Print Checklist
                  </button>
                  <button
                    onClick={generateTextFile}
                    className="px-4 py-2 occ-blue border-2 border-occ-blue rounded-lg hover:bg-occ-blue hover:occ-secondary-white transition-all font-medium shadow-sm"
                  >
                    Download TXT
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={isDownloadingPDF}
                    className="px-6 py-2 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all font-medium shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloadingPDF ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* API Status */}
              <div className="mt-4 pt-4 border-t-2 border-occ-secondary-gray">
                <div className="text-xs occ-gray">
                  PDF Endpoint: {API_BASE_URL}/api/checklist_validation/checklist/pdf
                </div>
              </div>

              {/* Completion Status */}
              <div className="mt-4 pt-4 border-t-2 border-occ-secondary-gray">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                    <div className="text-2xl font-bold occ-blue mb-1">{completedItems}</div>
                    <div className="text-xs occ-gray">Completed Items</div>
                  </div>
                  <div className="text-center p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                    <div className="text-2xl font-bold occ-secondary-orange mb-1">{checklist.length - completedItems}</div>
                    <div className="text-xs occ-gray">Remaining Items</div>
                  </div>
                  <div className="text-center p-3 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                    <div className="text-2xl font-bold occ-blue-dark mb-1">{completionPercentage}%</div>
                    <div className="text-xs occ-gray">Overall Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Summary Cards */}
          {!isGenerating && checklist.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-occ-secondary-white p-4 rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue rounded-lg">
                    <FileText className="w-5 h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold occ-blue-dark">{checklist.length}</div>
                    <div className="text-xs occ-gray">Total Items</div>
                  </div>
                </div>
              </div>

              <div className="bg-occ-secondary-white p-4 rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue rounded-lg">
                    <CheckCircle className="w-5 h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold occ-blue">{completedItems}</div>
                    <div className="text-xs occ-gray">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-occ-secondary-white p-4 rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-secondary-orange rounded-lg">
                    <Target className="w-5 h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold occ-secondary-orange">{checklist.length - completedItems}</div>
                    <div className="text-xs occ-gray">Pending</div>
                  </div>
                </div>
              </div>

              <div className="bg-occ-secondary-white p-4 rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-yellow rounded-lg">
                    <BarChart3 className="w-5 h-5 occ-blue-dark" />
                  </div>
                  <div>
                    <div className="text-lg font-bold occ-blue-dark">{completionPercentage}%</div>
                    <div className="text-xs occ-gray">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ChecklistGenerator;