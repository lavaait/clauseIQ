import React, { useState, useEffect } from 'react';
import { Download, Check, ChevronDown, FileText, Settings, RefreshCw, CheckCircle, BarChart3, Target } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ChecklistGenerator = () => {
  const [contractType, setContractType] = useState('Firm-Fixed-Price');
  const [agencyPolicy, setAgencyPolicy] = useState('Agency A');
  const [checklist, setChecklist] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined checklists based on contract type and agency
  const checklistData = {
    'Firm-Fixed-Price': {
      'Agency A': [
        { id: 1, text: 'Correct contract structure', checked: true },
        { id: 2, text: 'Specified contract period', checked: true },
        { id: 3, text: 'Price includes all costs', checked: true },
        { id: 4, text: 'Inspection and acceptance terms', checked: true },
        { id: 5, text: 'Termination clauses', checked: true },
        { id: 6, text: 'Certifications and representations', checked: true },
        { id: 7, text: 'Payment and invoicing terms', checked: true },
        { id: 8, text: 'Applicable FAR clauses', checked: true }
      ],
      'Agency B': [
        { id: 1, text: 'Correct contract structure', checked: true },
        { id: 2, text: 'Specified contract period', checked: true },
        { id: 3, text: 'Price includes all costs', checked: true },
        { id: 4, text: 'Performance work statement', checked: true },
        { id: 5, text: 'Quality assurance surveillance plan', checked: true },
        { id: 6, text: 'Security requirements', checked: true },
        { id: 7, text: 'Data rights provisions', checked: true },
        { id: 8, text: 'Applicable DFARS clauses', checked: true }
      ]
    },
    'Cost-Plus-Fixed-Fee': {
      'Agency A': [
        { id: 1, text: 'Cost accounting standards compliance', checked: true },
        { id: 2, text: 'Allowable cost provisions', checked: true },
        { id: 3, text: 'Fee structure definition', checked: true },
        { id: 4, text: 'Cost monitoring requirements', checked: true },
        { id: 5, text: 'Audit and records access', checked: true },
        { id: 6, text: 'Termination for convenience', checked: true },
        { id: 7, text: 'Progress reporting requirements', checked: true },
        { id: 8, text: 'Applicable cost accounting clauses', checked: true }
      ],
      'Agency B': [
        { id: 1, text: 'Cost accounting standards compliance', checked: true },
        { id: 2, text: 'Allowable cost provisions', checked: true },
        { id: 3, text: 'Fee structure definition', checked: true },
        { id: 4, text: 'Enhanced audit requirements', checked: true },
        { id: 5, text: 'Security clearance provisions', checked: true },
        { id: 6, text: 'Intellectual property rights', checked: true },
        { id: 7, text: 'Export control compliance', checked: true },
        { id: 8, text: 'DCAA audit readiness', checked: true }
      ]
    },
    'Time-and-Materials': {
      'Agency A': [
        { id: 1, text: 'Labor hour limitations', checked: true },
        { id: 2, text: 'Material cost controls', checked: true },
        { id: 3, text: 'Ceiling price establishment', checked: true },
        { id: 4, text: 'Labor category definitions', checked: true },
        { id: 5, text: 'Invoicing procedures', checked: true },
        { id: 6, text: 'Quality control measures', checked: true },
        { id: 7, text: 'Government oversight provisions', checked: true },
        { id: 8, text: 'T&M specific FAR clauses', checked: true }
      ],
      'Agency B': [
        { id: 1, text: 'Labor hour limitations', checked: true },
        { id: 2, text: 'Material cost controls', checked: true },
        { id: 3, text: 'Ceiling price establishment', checked: true },
        { id: 4, text: 'Security labor requirements', checked: true },
        { id: 5, text: 'Contractor personnel screening', checked: true },
        { id: 6, text: 'Government facility access', checked: true },
        { id: 7, text: 'Subcontractor oversight', checked: true },
        { id: 8, text: 'Performance metrics tracking', checked: true }
      ]
    }
  };

  const contractTypes = ['Firm-Fixed-Price', 'Cost-Plus-Fixed-Fee', 'Time-and-Materials'];
  const agencies = ['Agency A', 'Agency B', 'Agency C'];

  useEffect(() => {
    generateChecklist();
  }, [contractType, agencyPolicy]);

  const generateChecklist = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newChecklist = checklistData[contractType]?.[agencyPolicy] || checklistData[contractType]?.['Agency A'] || [];
      setChecklist(newChecklist);
      setIsGenerating(false);
    }, 800);
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const generatePDF = () => {
    const checklistText = checklist.map((item, index) => 
      `${index + 1}. [${item.checked ? 'X' : ' '}] ${item.text}`
    ).join('\n');

    const content = `Compliance Checklist
Contract Type: ${contractType}
Agency Policy: ${agencyPolicy}
Generated: ${new Date().toLocaleDateString()}

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

  const completedItems = checklist.filter(item => item.checked).length;
  const completionPercentage = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

  return (
    <MainLayout title="Compliance Checklist Generator" userRole="Checklist Generator">
      <div className="min-h-screen  pb-12">
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
          </div>

          {/* Modern Compliance Checklist */}
          <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray overflow-hidden">
            <div className="p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 occ-secondary-white" />
                  <h2 className="text-lg font-semibold occ-secondary-white">Compliance Checklist</h2>
                </div>
                {completionPercentage === 100 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-occ-yellow rounded-full">
                    <Check className="w-4 h-4 occ-blue-dark" />
                    <span className="text-sm font-medium occ-blue-dark">Complete</span>
                  </div>
                )}
              </div>
              
              {/* Modern Progress Bar */}
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
            </div>

            <div className="p-6">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 occ-blue mb-6 p-4 bg-occ-secondary-gray rounded-lg border border-occ-blue">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Generating checklist based on {contractType} and {agencyPolicy}...</span>
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

                  {checklist.length === 0 && !isGenerating && (
                    <div className="text-center py-12">
                      <div className="p-4 bg-occ-secondary-gray rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-10 h-10 occ-gray" />
                      </div>
                      <h3 className="text-lg font-medium occ-blue-dark mb-2">No Checklist Available</h3>
                      <p className="occ-gray">No checklist items available for this configuration</p>
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
                    onClick={generatePDF}
                    className="px-6 py-2 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all font-medium shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
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
    </MainLayout>
  );
};

export default ChecklistGenerator;