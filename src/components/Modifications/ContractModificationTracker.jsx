import React, { useState, useEffect } from 'react';
import { Plus, Edit3, AlertTriangle, TrendingUp, Calendar, DollarSign, Clock, FileText, Target, BarChart3, ChevronDown, Save, X, CheckCircle, TrendingDown, AlertCircle, Info, Upload, User, ArrowUp, ArrowDown, Menu, RefreshCw, Eye, ChevronRight, Activity } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ContractModificationTracker = () => {
  const [modifications, setModifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModification, setSelectedModification] = useState(null);
  const [formData, setFormData] = useState({
    modificationType: 'Schedule',
    justification: 'Project delays due to additional requirements',
    effectiveDate: '04/30/2024',
    endDate: '07/31/2024',
    modifiedBy: 'U.S.Q.K',
    loggedBy: 'J.Smith'
  });

  const modificationTypes = ['Schedule', 'Budget', 'Scope', 'Personnel', 'Technical', 'Compliance'];

  // Mock version history data
  const versionHistory = [
    { id: 1, type: 'Funding', description: 'Budget increase of $1M', date: '04/15/2024', user: 'You', status: 'approved' },
    { id: 2, type: 'Scope', description: 'Added new reporting requirements', date: '06/01/2024', user: 'Admin', status: 'pending' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const newModification = {
        id: Date.now(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      setModifications(prev => [newModification, ...prev]);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <MainLayout title='Contract Modifications' userRole='Contract Manager'>
      <div className="min-h-screen  p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-occ-secondary-white rounded-lg">
                  <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 occ-blue" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">Contract Modifications</h1>
                  <p className="occ-secondary-white opacity-90 text-xs sm:text-sm">Track and analyze contract changes with AI-powered insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Log Modification Form */}
            <div className="bg-occ-secondary-white rounded-lg shadow-sm border border-occ-secondary-gray p-6">
              <h2 className="text-lg font-semibold text-occ-secondary-black mb-6">Log Modification</h2>
              
              <div className="space-y-4">
                {/* Modification Type */}
                <div>
                  <label className="block text-sm font-medium text-occ-gray mb-2">
                    Modification Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.modificationType}
                      onChange={(e) => handleInputChange('modificationType', e.target.value)}
                      className="w-full px-3 py-2 border border-occ-secondary-gray rounded-md bg-occ-secondary-white text-occ-secondary-black focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none"
                    >
                      {modificationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-occ-gray pointer-events-none" />
                  </div>
                </div>

                {/* Justification */}
                <div>
                  <label className="block text-sm font-medium text-occ-gray mb-2">
                    Justification
                  </label>
                  <textarea
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-occ-secondary-gray rounded-md text-occ-secondary-black focus:ring-2 focus:ring-occ-blue focus:border-occ-blue resize-none"
                    placeholder="Project delays due to additional requirements..."
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-occ-gray mb-2">
                      Effective Date
                    </label>
                    <input
                      type="text"
                      value={formData.effectiveDate}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      className="w-full px-3 py-2 border border-occ-secondary-gray rounded-md text-occ-secondary-black focus:ring-2 focus:ring-occ-blue focus:border-occ-blue"
                      placeholder="04/30/2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-occ-gray mb-2">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-occ-secondary-gray rounded-md text-occ-secondary-black focus:ring-2 focus:ring-occ-blue focus:border-occ-blue"
                      placeholder="07/31/2024"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isAnalyzing}
                    className="w-full px-4 py-2 bg-occ-blue occ-secondary-white rounded-md hover:bg-occ-blue-dark transition-colors font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Impact Analysis Section */}
              <div className="mt-8 pt-6 border-t border-occ-secondary-gray">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-occ-blue rounded-full"></div>
                  <h3 className="text-sm font-medium text-occ-blue">AI-driven</h3>
                </div>
                
                <h3 className="text-base font-semibold text-occ-secondary-black mb-4">Impact Analysis</h3>
                
                {/* Contract Lifecycle Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-occ-gray">Impact on Contract Lifecycle</span>
                    <span className="text-sm font-medium text-occ-secondary-black">Improving ✓</span>
                  </div>
                  <div className="flex justify-between text-xs text-occ-gray mb-3">
                    <span>Start Date</span>
                    <span>5/19/2024</span>
                  </div>
                  <div className="relative mb-2">
                    <div className="h-2 bg-occ-secondary-gray rounded-full overflow-hidden">
                      <div className="h-full bg-occ-blue rounded-full transition-all duration-500" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-occ-gray">
                    <span>04/30/2024</span>
                    <span>01/29/2024</span>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-occ-gray">Risk Increase</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-occ-blue">+5%</span>
                    </div>
                  </div>
                  <div className="text-xs text-occ-gray">Modified by U.S.Q.K 04/15</div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-occ-gray">Obligations On-time</span>
                    <span className="text-sm font-medium text-occ-secondary-black">87%</span>
                  </div>
                  <div className="text-xs text-occ-gray">Logged by J. Smith 03/01/24</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Impact Analysis Card */}
              <div className="bg-occ-secondary-white rounded-lg shadow-sm border border-occ-secondary-gray p-6">
                <h3 className="text-lg font-semibold text-occ-secondary-black mb-4">Impact Analysis</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-occ-secondary-gray rounded-lg border border-occ-blue">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-occ-blue" />
                      <span className="text-sm font-medium text-occ-blue-dark">Impact on Contract Lifecycle</span>
                    </div>
                    <div className="text-sm text-occ-blue">
                      Improving ✓ 5/19/2024
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-occ-secondary-gray rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-occ-gray">Risk Increase</span>
                        <div className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3 text-occ-blue" />
                          <span className="text-sm font-medium text-occ-blue">+5%</span>
                        </div>
                      </div>
                      <div className="text-xs text-occ-gray">Modified by U.S.Q.K</div>
                    </div>
                    
                    <div className="p-3 bg-occ-secondary-gray rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-occ-gray">Obligations On-time</span>
                        <span className="text-sm font-medium text-occ-secondary-black">87%</span>
                      </div>
                      <div className="text-xs text-occ-gray">Logged by J. Smith</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version History */}
              <div className="bg-occ-secondary-white rounded-lg shadow-sm border border-occ-secondary-gray p-6">
                <h3 className="text-lg font-semibold text-occ-secondary-black mb-4">Version History</h3>
                
                <div className="space-y-4">
                  {versionHistory.map((version) => (
                    <div key={version.id} className="p-3 bg-occ-secondary-gray rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-occ-secondary-black">{version.type}: {version.description}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          version.status === 'approved' 
                            ? 'bg-occ-blue occ-secondary-white' 
                            : 'bg-occ-yellow text-occ-secondary-black'
                        }`}>
                          {version.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-occ-gray">
                        <span>{version.date}</span>
                        <span>{version.user}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Section */}
                <div className="mt-6 pt-4 border-t border-occ-secondary-gray">
                  <div className="flex items-center gap-3 p-4 border-2 border-dashed border-occ-secondary-gray rounded-lg hover:border-occ-blue cursor-pointer transition-colors">
                    <div className="p-2 bg-occ-secondary-gray rounded-lg">
                      <Upload className="w-4 h-4 text-occ-gray" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-occ-secondary-black">
                        Upload amended Document
                      </div>
                      <div className="text-xs text-occ-gray">
                        Drag and drop or click to browse
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Modifications */}
          {modifications.length > 0 && (
            <div className="mt-8">
              <div className="bg-occ-secondary-white rounded-lg shadow-sm border border-occ-secondary-gray">
                <div className="p-6 border-b border-occ-secondary-gray">
                  <h2 className="text-lg font-semibold text-occ-secondary-black flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Modifications
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {modifications.map((mod) => (
                      <div 
                        key={mod.id} 
                        className="p-4 rounded-lg border border-occ-secondary-gray hover:border-occ-blue transition-colors cursor-pointer"
                        onClick={() => setSelectedModification(selectedModification === mod.id ? null : mod.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-occ-secondary-gray rounded-lg">
                              <Edit3 className="w-4 h-4 text-occ-blue" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-occ-secondary-black">
                                {mod.modificationType}
                              </span>
                              <div className="text-xs text-occ-gray">
                                {mod.effectiveDate} - {mod.endDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium bg-occ-yellow text-occ-secondary-black rounded-full">
                              Pending
                            </span>
                            <ChevronRight className={`w-4 h-4 text-occ-gray transition-transform ${selectedModification === mod.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        {mod.justification && (
                          <p className="text-sm text-occ-gray mb-2">
                            {mod.justification}
                          </p>
                        )}

                        {selectedModification === mod.id && (
                          <div className="pt-4 border-t border-occ-secondary-gray">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs text-occ-gray mb-1">Modified By</div>
                                <div className="text-sm font-medium text-occ-secondary-black">{mod.modifiedBy}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs text-occ-gray mb-1">Logged By</div>
                                <div className="text-sm font-medium text-occ-secondary-black">{mod.loggedBy}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs text-occ-gray mb-1">Created Date</div>
                                <div className="text-sm font-medium text-occ-secondary-black">{mod.createdDate}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs text-occ-gray mb-1">Status</div>
                                <div className="text-sm font-medium text-occ-secondary-black">{mod.status}</div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <button className="px-4 py-2 bg-occ-blue text-occ-secondary-white rounded-lg text-sm font-medium hover:bg-occ-blue-dark hover:bg-occ-secondary-white  transition-colors flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button className="px-4 py-2 text-occ-blue border border-occ-blue rounded-lg text-sm font-medium hover:bg-occ-secondary-gray transition-colors flex items-center gap-2">
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                              <button className="px-4 py-2 bg-occ-secondary-orange text-occ-secondary-white rounded-lg text-sm font-medium hover:bg-occ-secondary-orange transition-colors flex items-center gap-2">
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

export default ContractModificationTracker;