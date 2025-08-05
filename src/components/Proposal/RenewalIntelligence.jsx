import React, { useState, useEffect } from 'react';
import {
  Calendar, AlertTriangle, TrendingUp, FileText, Clock, 
  RefreshCw, XCircle, DollarSign, Brain, Send, ChevronRight,
  Bell, Filter, Download, Eye, Sparkles, AlertCircle,
  CheckCircle, Timer, BarChart3, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, FileWarning, Target,
  Zap, Shield, Edit3, X, Save, Mail, Menu
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import '../occ-colors.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

const RenewalIntelligence = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('90days');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sample contract data
  const contracts = [
    {
      id: 1,
      contractNumber: 'CTR-2024-001',
      vendor: 'Tech Solutions Inc.',
      value: 250000,
      expiryDate: '2025-09-15',
      daysUntilExpiry: 42,
      status: 'critical',
      type: 'Software License',
      department: 'IT',
      performanceScore: 85,
      aiRecommendation: {
        action: 'renew',
        confidence: 92,
        reasoning: 'High performance score, critical system dependency, favorable terms'
      },
      renewalHistory: [
        { date: '2023-09-15', action: 'renewed', value: 225000 },
        { date: '2022-09-15', action: 'renewed', value: 200000 }
      ]
    },
    {
      id: 2,
      contractNumber: 'CTR-2024-002',
      vendor: 'Office Supplies Co.',
      value: 45000,
      expiryDate: '2025-10-30',
      daysUntilExpiry: 87,
      status: 'warning',
      type: 'Supply Agreement',
      department: 'Procurement',
      performanceScore: 65,
      aiRecommendation: {
        action: 'renegotiate',
        confidence: 78,
        reasoning: 'Average performance, market rates have decreased by 15%'
      },
      renewalHistory: [
        { date: '2023-10-30', action: 'renewed', value: 45000 }
      ]
    },
    {
      id: 3,
      contractNumber: 'CTR-2024-003',
      vendor: 'Consulting Group LLC',
      value: 180000,
      expiryDate: '2025-08-20',
      daysUntilExpiry: 15,
      status: 'urgent',
      type: 'Professional Services',
      department: 'Operations',
      performanceScore: 45,
      aiRecommendation: {
        action: 'terminate',
        confidence: 88,
        reasoning: 'Low performance score, deliverables not met, alternative vendors available'
      },
      renewalHistory: [
        { date: '2024-08-20', action: 'renewed', value: 180000 }
      ]
    },
    {
      id: 4,
      contractNumber: 'CTR-2024-004',
      vendor: 'Cloud Services Pro',
      value: 500000,
      expiryDate: '2025-11-15',
      daysUntilExpiry: 103,
      status: 'normal',
      type: 'Cloud Infrastructure',
      department: 'IT',
      performanceScore: 95,
      aiRecommendation: {
        action: 'renew',
        confidence: 95,
        reasoning: 'Excellent performance, critical infrastructure, competitive pricing'
      },
      renewalHistory: [
        { date: '2023-11-15', action: 'renewed', value: 450000 },
        { date: '2022-11-15', action: 'renewed', value: 400000 }
      ]
    }
  ];

  // Chart data for renewal status
  const renewalStatusData = {
    labels: ['Urgent', 'Critical', 'Warning', 'Normal'],
    datasets: [{
      data: [1, 1, 1, 1],
      backgroundColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e'
      ],
      borderWidth: 0
    }]
  };

  // Timeline chart data
  const timelineData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [{
      label: 'Contracts Expiring',
      data: [1, 1, 1, 1, 0, 0],
      borderColor: '#0066CC',
      backgroundColor: 'rgba(0, 102, 204, 0.1)',
      tension: 0.4
    }]
  };

  // Value by action chart
  const valueByActionData = {
    labels: ['Renew', 'Renegotiate', 'Terminate'],
    datasets: [{
      label: 'Contract Value',
      data: [750000, 45000, 180000],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444']
    }]
  };

  const getStatusBadge = (status) => {
    const badges = {
      urgent: { color: 'bg-red-600 text-white', icon: AlertTriangle, text: 'Urgent' },
      critical: { color: 'bg-orange-500 text-white', icon: AlertCircle, text: 'Critical' },
      warning: { color: 'bg-yellow-500 text-white', icon: Clock, text: 'Warning' },
      normal: { color: 'bg-green-500 text-white', icon: CheckCircle, text: 'Normal' }
    };
    
    const badge = badges[status] || badges.normal;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{badge.text}</span>
      </span>
    );
  };

  const getActionIcon = (action) => {
    const icons = {
      renew: RefreshCw,
      renegotiate: TrendingUp,
      terminate: XCircle
    };
    return icons[action] || RefreshCw;
  };

  const getActionColor = (action) => {
    const colors = {
      renew: 'text-green-600 bg-green-50',
      renegotiate: 'text-yellow-600 bg-yellow-50',
      terminate: 'text-red-600 bg-red-50'
    };
    return colors[action] || 'text-gray-600 bg-gray-50';
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    // Simulate API call
    setTimeout(() => {
      setIsGeneratingDraft(false);
      // In real implementation, this would open a draft editor with generated content
    }, 2000);
  };

  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
    if (window.innerWidth < 1024) {
      setShowMobileDetails(true);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (filterStatus === 'all') return true;
    return contract.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-occ-secondary-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Enhanced Header - Responsive */}
        <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-3 sm:mb-4 md:mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white opacity-5 rounded-full -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32"></div>
          
          <div className="flex flex-col gap-3 sm:gap-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  <span className="truncate">Renewal Intelligence</span>
                </h1>
                <p className="text-white opacity-90 mt-1 text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  AI-powered contract renewal recommendations
                </p>
              </div>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden absolute top-0 right-0 p-2 text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            {/* Controls - Mobile Dropdown / Desktop Inline */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white sm:bg-opacity-20 sm:backdrop-blur-sm text-gray-700 sm:text-white rounded-lg border border-gray-300 sm:border-white sm:border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-sm"
                >
                  <option value="30days" className="text-gray-700">Next 30 Days</option>
                  <option value="60days" className="text-gray-700">Next 60 Days</option>
                  <option value="90days" className="text-gray-700">Next 90 Days</option>
                  <option value="180days" className="text-gray-700">Next 180 Days</option>
                </select>
                
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-occ-yellow text-occ-blue-dark rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">3</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Urgent Renewals</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Next 30 days</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">$975K</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Total Value</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">At risk</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">89%</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">AI Confidence</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Average score</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">12</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Action Items</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">This quarter</p>
          </div>
        </div>

        {/* Navigation Tabs - Scrollable on Mobile */}
        <div className="bg-white rounded-lg shadow-md mb-3 sm:mb-4 md:mb-6 overflow-x-auto">
          <div className="flex min-w-full">
            {['timeline', 'contracts', 'analytics', 'history'].map((tab) => (
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
                  {tab === 'timeline' && <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'contracts' && <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'analytics' && <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {tab === 'history' && <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{tab}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'timeline' && (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {/* Timeline View */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-occ-blue" />
                  Renewal Timeline
                </h2>
                
                <div className="space-y-4">
                  {filteredContracts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).map((contract) => (
                    <div
                      key={contract.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleContractSelect(contract)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-12 rounded-full ${
                            contract.status === 'urgent' ? 'bg-red-500' :
                            contract.status === 'critical' ? 'bg-orange-500' :
                            contract.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{contract.vendor}</h3>
                            <p className="text-sm text-gray-600">{contract.contractNumber}</p>
                          </div>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Expires</p>
                          <p className="font-medium text-gray-900">{contract.daysUntilExpiry} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Value</p>
                          <p className="font-medium text-gray-900">${contract.value.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium text-gray-900">{contract.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Performance</p>
                          <p className="font-medium text-gray-900">{contract.performanceScore}%</p>
                        </div>
                      </div>
                      
                      {/* AI Recommendation */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              AI Recommends: {contract.aiRecommendation.action.charAt(0).toUpperCase() + contract.aiRecommendation.action.slice(1)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {contract.aiRecommendation.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Sidebar - Contract Details */}
              <div className="space-y-6">
                {selectedContract ? (
                  <>
                    {/* AI Recommendation Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-occ-blue" />
                        AI Analysis
                      </h3>
                      
                      <div className={`p-4 rounded-lg mb-4 ${getActionColor(selectedContract.aiRecommendation.action)}`}>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = getActionIcon(selectedContract.aiRecommendation.action);
                            return <Icon className="w-6 h-6" />;
                          })()}
                          <div>
                            <p className="font-semibold capitalize">{selectedContract.aiRecommendation.action}</p>
                            <p className="text-sm opacity-75">Recommended Action</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Confidence Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-occ-blue h-2 rounded-full"
                                style={{ width: `${selectedContract.aiRecommendation.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{selectedContract.aiRecommendation.confidence}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Reasoning</p>
                          <p className="text-sm text-gray-700">{selectedContract.aiRecommendation.reasoning}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => {
                            setSelectedAction(selectedContract.aiRecommendation.action);
                            setShowDraftModal(true);
                          }}
                          className="w-full px-4 py-2 bg-occ-blue text-white rounded-lg font-medium hover:bg-occ-blue-dark transition-colors flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Generate {selectedContract.aiRecommendation.action} Notice
                        </button>
                        
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Full Analysis
                        </button>
                      </div>
                    </div>
                    
                    {/* Contract History */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-occ-blue" />
                        Renewal History
                      </h3>
                      
                      <div className="space-y-3">
                        {selectedContract.renewalHistory.map((history, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{history.date}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 capitalize">{history.action}</p>
                              <p className="text-xs text-gray-500">${history.value.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a contract to view details</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden">
              {!showMobileDetails ? (
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-occ-blue" />
                    Renewal Timeline
                  </h2>
                  
                  <div className="space-y-3">
                    {filteredContracts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).map((contract) => (
                      <div
                        key={contract.id}
                        className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleContractSelect(contract)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-8 sm:h-10 rounded-full ${
                              contract.status === 'urgent' ? 'bg-red-500' :
                              contract.status === 'critical' ? 'bg-orange-500' :
                              contract.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{contract.vendor}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">{contract.contractNumber}</p>
                            </div>
                          </div>
                          {getStatusBadge(contract.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Expires</p>
                            <p className="font-medium text-gray-900">{contract.daysUntilExpiry} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Value</p>
                            <p className="font-medium text-gray-900">${(contract.value/1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        
                        {/* AI Recommendation - Mobile */}
                        <div className="p-2 bg-blue-50 rounded flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-gray-900">
                              AI: {contract.aiRecommendation.action}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Back Button */}
                  <button
                    onClick={() => setShowMobileDetails(false)}
                    className="flex items-center gap-2 text-occ-blue font-medium text-sm"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to Timeline
                  </button>
                  
                  {/* Mobile Contract Details */}
                  {selectedContract && (
                    <>
                      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">{selectedContract.vendor}</h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Contract #</p>
                            <p className="font-medium">{selectedContract.contractNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Expires In</p>
                            <p className="font-medium">{selectedContract.daysUntilExpiry} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Value</p>
                            <p className="font-medium">${selectedContract.value.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Performance</p>
                            <p className="font-medium">{selectedContract.performanceScore}%</p>
                          </div>
                        </div>
                        
                        {/* AI Recommendation */}
                        <div className={`p-3 rounded-lg ${getActionColor(selectedContract.aiRecommendation.action)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {(() => {
                              const Icon = getActionIcon(selectedContract.aiRecommendation.action);
                              return <Icon className="w-5 h-5" />;
                            })()}
                            <p className="font-semibold capitalize">{selectedContract.aiRecommendation.action}</p>
                          </div>
                          <p className="text-xs opacity-75">{selectedContract.aiRecommendation.reasoning}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedAction(selectedContract.aiRecommendation.action);
                            setShowDraftModal(true);
                          }}
                          className="w-full mt-3 px-4 py-2 bg-occ-blue text-white rounded-lg font-medium hover:bg-occ-blue-dark transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Zap className="w-4 h-4" />
                          Generate Notice
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'contracts' && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">All Contracts</h2>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-occ-blue"
                >
                  <option value="all">All Status</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="normal">Normal</option>
                </select>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-1">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">More Filters</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{contract.vendor}</p>
                      <p className="text-xs text-gray-500">{contract.contractNumber}</p>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gray-500">Expires</p>
                      <p className="font-medium">{contract.daysUntilExpiry} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Value</p>
                      <p className="font-medium">${(contract.value/1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {(() => {
                        const Icon = getActionIcon(contract.aiRecommendation.action);
                        return <Icon className="w-3 h-3 text-gray-600" />;
                      })()}
                      <span className="text-xs text-gray-700 capitalize">{contract.aiRecommendation.action}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedContract(contract);
                        setSelectedAction(contract.aiRecommendation.action);
                        setShowDraftModal(true);
                      }}
                      className="text-occ-blue text-xs font-medium"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Contract</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Vendor</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Expiry</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Value</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Status</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm hidden lg:table-cell">AI Rec</th>
                    <th className="text-left py-3 px-2 md:px-4 font-medium text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 md:px-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{contract.contractNumber}</p>
                          <p className="text-xs text-gray-500 md:hidden">{contract.type}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-gray-700 text-sm">{contract.vendor}</td>
                      <td className="py-3 px-2 md:px-4">
                        <p className="text-gray-700 text-sm">{contract.daysUntilExpiry}d</p>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-gray-700 text-sm">${(contract.value/1000).toFixed(0)}K</td>
                      <td className="py-3 px-2 md:px-4">{getStatusBadge(contract.status)}</td>
                      <td className="py-3 px-2 md:px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const Icon = getActionIcon(contract.aiRecommendation.action);
                            return <Icon className="w-4 h-4 text-gray-600" />;
                          })()}
                          <span className="text-sm text-gray-700 capitalize">{contract.aiRecommendation.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 md:px-4">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setSelectedAction(contract.aiRecommendation.action);
                            setShowDraftModal(true);
                          }}
                          className="text-occ-blue hover:text-occ-blue-dark font-medium text-xs sm:text-sm"
                        >
                          Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Renewal Status Chart */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Renewal Status</h3>
              <div className="h-48 sm:h-56 md:h-64">
                <Doughnut 
                  data={renewalStatusData} 
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    },
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
            
            {/* Timeline Chart */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Expiry Timeline</h3>
              <div className="h-48 sm:h-56 md:h-64">
                <Line 
                  data={timelineData}
                  options={{
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Value by Action */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 md:col-span-2 lg:col-span-1">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Value by Action</h3>
              <div className="h-48 sm:h-56 md:h-64">
                <Bar 
                  data={valueByActionData}
                  options={{
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Renewal History</h2>
            <div className="space-y-3">
              {contracts.flatMap(contract => 
                contract.renewalHistory.map((history, idx) => ({
                  ...history,
                  contractNumber: contract.contractNumber,
                  vendor: contract.vendor,
                  id: `${contract.id}-${idx}`
                }))
              ).sort((a, b) => new Date(b.date) - new Date(a.date)).map((item) => (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hidden sm:block">
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.vendor}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{item.contractNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 capitalize text-sm">{item.action}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draft Generation Modal - Responsive */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-occ-blue p-3 sm:p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Generate {selectedAction} Notice</span>
              </h2>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-white hover:bg-blue-700 rounded-lg p-1.5 sm:p-2 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4 md:p-6">
              {isGeneratingDraft ? (
                <div className="text-center py-8 sm:py-12">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-occ-blue mx-auto mb-3 sm:mb-4 animate-pulse" />
                  <p className="text-gray-700 text-sm sm:text-base">AI is generating your draft...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Contract Details</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-600">Contract Number</p>
                          <p className="font-medium">{selectedContract?.contractNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vendor</p>
                          <p className="font-medium truncate">{selectedContract?.vendor}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-medium">${(selectedContract?.value/1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expiry Date</p>
                          <p className="font-medium">{selectedContract?.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Draft Preview</h3>
                    <div className="border rounded-lg p-3 sm:p-4 bg-gray-50 max-h-32 sm:max-h-40 overflow-y-auto">
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {selectedAction === 'renew' && "Dear [Vendor Contact], We are pleased to inform you of our intent to renew the above-referenced contract. Based on our positive experience and continued need for your services..."}
                        {selectedAction === 'renegotiate' && "Dear [Vendor Contact], As we approach the expiration of the above-referenced contract, we would like to discuss potential modifications to better align with our current requirements..."}
                        {selectedAction === 'terminate' && "Dear [Vendor Contact], This letter serves as formal notice of our intent not to renew the above-referenced contract upon its expiration..."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleGenerateDraft}
                      className="flex-1 px-3 sm:px-4 py-2 bg-occ-blue text-white rounded-lg font-medium hover:bg-occ-blue-dark transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Full Draft
                    </button>
                    <button className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <Edit3 className="w-4 h-4" />
                      Edit Template
                    </button>
                    <button className="sm:flex-initial px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewalIntelligence;