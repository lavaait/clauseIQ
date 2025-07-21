import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText, 
  Target, 
  BarChart3,
  ChevronDown,
  Save,
  X,
  CheckCircle,
  TrendingDown,
  AlertCircle,
  Info,
  Upload,
  User,
  ArrowUp,
  ArrowDown,
  Menu,
  RefreshCw,
  Eye,
  ChevronRight,
  Activity
} from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ContractModificationTracker = () => {
  const [modifications, setModifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedModification, setSelectedModification] = useState(null);
  const [formData, setFormData] = useState({
    modificationType: 'Schedule',
    justification: '',
    effectiveDate: '',
    endDate: '',
    impactOnContractLifecycle: 'Improving',
    riskIncrease: '5%',
    obligationsOnTime: '87%',
    costVariance: '$75K',
    modifiedBy: 'U.S.Q.K',
    loggedBy: 'J.Smith'
  });

  const modificationTypes = ['Schedule', 'Budget', 'Scope', 'Personnel', 'Technical', 'Compliance'];
  const impactTypes = ['Improving', 'Neutral', 'Declining'];

  // Mock version history data
  const versionHistory = [
    {
      id: 1,
      type: 'Funding',
      description: 'Budget increase of $1M',
      date: '04/15/2024',
      user: 'You',
      status: 'approved'
    },
    {
      id: 2,
      type: 'Scope',
      description: 'Added new reporting requirements',
      date: '06/01/2024',
      user: 'Admin',
      status: 'pending'
    },
    {
      id: 3,
      type: 'Schedule',
      description: 'Extended project timeline by 3 months',
      date: '03/20/2024',
      user: 'Project Manager',
      status: 'approved'
    }
  ];

  // Key metrics data
  const keyMetrics = [
    {
      title: 'Total Modifications',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Edit3,
      color: 'blue'
    },
    {
      title: 'Pending Approvals',
      value: '7',
      change: '+2',
      trend: 'up',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Risk Level',
      value: 'Medium',
      change: '+5%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Cost Impact',
      value: '$2.4M',
      change: '+$75K',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      setShowForm(false);
      setIsAnalyzing(false);
      
      // Reset form
      setFormData({
        modificationType: 'Schedule',
        justification: '',
        effectiveDate: '',
        endDate: '',
        impactOnContractLifecycle: 'Improving',
        riskIncrease: '5%',
        obligationsOnTime: '87%',
        costVariance: '$75K',
        modifiedBy: 'U.S.Q.K',
        loggedBy: 'J.Smith'
      });
    }, 1500);
  };

  const getMetricColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-occ-blue';
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-occ-secondary-orange';
      case 'yellow':
        return 'bg-occ-yellow';
      default:
        return 'bg-occ-blue';
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          classes: 'bg-green-50 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'pending':
        return {
          classes: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'rejected':
        return {
          classes: 'bg-red-50 text-red-800 border-red-200',
          icon: X
        };
      default:
        return {
          classes: 'bg-gray-50 text-gray-800 border-gray-200',
          icon: Info
        };
    }
  };

  return (
    <MainLayout title="Contract Modification Tracker" userRole="Modification Tracker">
      <div className="min-h-screen pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-secondary-white rounded-lg">
                      <Edit3 className="w-8 h-8 occ-blue" />
                  </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold occ-secondary-white">Log Modification</h1>
              </div>
              </div>
            </div>

          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`p-2 sm:p-3 ${getMetricColorClasses(metric.color)} rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 occ-secondary-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    metric.trend === 'up' ? 'occ-blue' : 'occ-secondary-orange'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold occ-blue-dark mb-1">
                    {metric.value}
                  </div>
                  <div className="text-xs sm:text-sm occ-gray font-medium leading-tight">
                    {metric.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Log Modification Form */}
            <div className={`xl:col-span-2 bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray transition-all duration-300 ${showForm ? 'block' : 'hidden xl:block'}`}>
              <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold occ-secondary-white flex items-center gap-2">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Log Modification
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="xl:hidden p-1 occ-secondary-white hover:bg-occ-blue-dark rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Modification Type */}
                <div>
                  <label className="block text-sm font-medium occ-blue-dark mb-2">
                    Modification Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.modificationType}
                      onChange={(e) => handleInputChange('modificationType', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-10 border-2 border-occ-secondary-gray rounded-lg bg-occ-secondary-white occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue appearance-none text-sm"
                    >
                      {modificationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 occ-gray pointer-events-none" />
                  </div>
                </div>

                {/* Justification */}
                <div>
                  <label className="block text-sm font-medium occ-blue-dark mb-2">
                    Justification
                  </label>
                  <textarea
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-occ-secondary-gray rounded-lg occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue resize-none text-sm"
                    placeholder="Project delays due to additional requirements..."
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium occ-blue-dark mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-occ-secondary-gray rounded-lg occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium occ-blue-dark mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                                           className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-occ-secondary-gray rounded-lg occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                    />
                  </div>
                </div>

                {/* Impact Analysis Section */}
                <div className="pt-4 sm:pt-6 border-t-2 border-occ-secondary-gray">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-occ-blue rounded-full"></div>
                    <h3 className="text-sm font-medium occ-blue">AI-driven Impact Analysis</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium occ-blue-dark mb-2">
                        Modified By
                      </label>
                      <input
                        type="text"
                        value={formData.modifiedBy}
                        onChange={(e) => handleInputChange('modifiedBy', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-occ-secondary-gray rounded-lg occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium occ-blue-dark mb-2">
                        Logged By
                      </label>
                      <input
                        type="text"
                        value={formData.loggedBy}
                        onChange={(e) => handleInputChange('loggedBy', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-occ-secondary-gray rounded-lg occ-blue-dark focus:ring-2 focus:ring-occ-blue focus:border-occ-blue text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 sm:pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isAnalyzing || !formData.justification || !formData.effectiveDate}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all font-medium shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Analyzing Impact...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Submit Modification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* AI Impact Analysis */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue-dark">
                  <h3 className="font-semibold occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    Live Impact Analysis
                  </h3>
                </div>
                
                <div className="p-4 sm:p-6">
                  {/* Contract Lifecycle Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium occ-blue-dark">Contract Lifecycle</span>
                      <span className="text-sm font-bold occ-blue">65%</span>
                    </div>
                    <div className="relative mb-3">
                      <div className="h-2 sm:h-3 bg-occ-secondary-gray rounded-full overflow-hidden">
                        <div className="h-full bg-occ-blue rounded-full transition-all duration-500" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs occ-gray">
                      <span>Start: 04/30/2024</span>
                      <span>End: 10/21/2024</span>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm occ-gray">Risk Increase</span>
                        <div className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-occ-secondary-orange" />
                          <span className="text-sm sm:text-base font-bold text-occ-secondary-orange">5%</span>
                        </div>
                      </div>
                      <div className="text-xs occ-gray">Modified by U.S.Q.K</div>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm occ-gray">Obligations On-time</span>
                        <span className="text-sm sm:text-base font-bold occ-blue-dark">87%</span>
                      </div>
                      <div className="text-xs occ-gray">Logged by J. Smith</div>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-occ-secondary-gray rounded-lg border border-occ-secondary-gray">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm occ-gray">Cost Variance</span>
                        <div className="flex items-center gap-1">
                          <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-occ-secondary-orange" />
                          <span className="text-sm sm:text-base font-bold text-occ-secondary-orange">$75K</span>
                        </div>
                      </div>
                      <div className="text-xs occ-gray">Budget impact analysis</div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-occ-blue rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                      <span className="text-sm sm:text-base font-medium occ-secondary-white">Analysis Complete</span>
                    </div>
                    <div className="text-xs sm:text-sm occ-secondary-white opacity-90">
                      All impact metrics have been calculated and are ready for review.
                    </div>
                  </div>
                </div>
              </div>

              {/* Version History */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
                  <h3 className="font-semibold occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    Version History
                  </h3>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {versionHistory.map((version) => {
                      const statusConfig = getStatusConfig(version.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={version.id} className="group p-3 sm:p-4 rounded-lg border-2 border-occ-secondary-gray hover:border-occ-blue transition-all duration-200 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-occ-blue rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium occ-blue-dark">{version.type}:</span>
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.classes}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {version.status}
                                </div>
                              </div>
                              <div className="text-sm occ-gray mb-2 leading-relaxed">
                                {version.description}
                              </div>
                              <div className="flex items-center gap-3 text-xs occ-gray">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {version.user}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {version.date}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 occ-gray group-hover:occ-blue transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload Section */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-occ-secondary-gray">
                    <div className="group p-4 sm:p-6 border-2 border-dashed border-occ-secondary-gray rounded-lg hover:border-occ-blue cursor-pointer transition-all duration-200">
                      <div className="flex items-center gap-3 text-center">
                        <div className="p-2 bg-occ-secondary-gray rounded-lg group-hover:bg-occ-blue group-hover:text-white transition-all">
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium occ-blue-dark group-hover:occ-blue transition-colors">
                            Upload Amended Document
                          </div>
                          <div className="text-xs occ-gray">
                            Drag and drop or click to browse
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Modifications List */}
          {modifications.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue">
                  <h2 className="text-base sm:text-lg font-semibold occ-secondary-white flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Recent Modifications
                  </h2>
                </div>
                
                <div className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {modifications.map((mod, index) => (
                      <div 
                        key={mod.id} 
                        className="group p-4 sm:p-5 rounded-xl border-2 border-occ-secondary-gray hover:border-occ-blue transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedModification(selectedModification === mod.id ? null : mod.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-occ-blue rounded-lg group-hover:scale-110 transition-transform">
                              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                            </div>
                            <div>
                              <span className="text-sm sm:text-base font-semibold occ-blue-dark group-hover:occ-blue transition-colors">
                                {mod.modificationType}
                              </span>
                              <div className="text-xs sm:text-sm occ-gray">
                                {mod.effectiveDate} - {mod.endDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 text-xs font-medium bg-occ-yellow occ-blue-dark rounded-full">
                              Pending
                            </span>
                            <ChevronRight className={`w-4 h-4 occ-gray group-hover:occ-blue transition-all ${selectedModification === mod.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        {mod.justification && (
                          <p className="text-sm occ-gray leading-relaxed mb-3">
                            {mod.justification}
                          </p>
                        )}

                        {/* Expanded Details */}
                        {selectedModification === mod.id && (
                          <div className="pt-4 border-t-2 border-occ-secondary-gray">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                            <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs occ-gray mb-1">Modified By</div>
                                <div className="text-sm font-medium occ-blue-dark">{mod.modifiedBy}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs occ-gray mb-1">Logged By</div>
                                <div className="text-sm font-medium occ-blue-dark">{mod.loggedBy}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs occ-gray mb-1">Created Date</div>
                                <div className="text-sm font-medium occ-blue-dark">{mod.createdDate}</div>
                              </div>
                              <div className="p-3 bg-occ-secondary-gray rounded-lg">
                                <div className="text-xs occ-gray mb-1">Status</div>
                                <div className="text-sm font-medium occ-blue-dark">{mod.status}</div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button className="px-3 sm:px-4 py-2 bg-occ-blue occ-secondary-white rounded-lg text-xs sm:text-sm font-medium hover:bg-occ-blue-dark transition-colors flex items-center gap-2">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                View Details
                              </button>
                              <button className="px-3 sm:px-4 py-2 occ-blue border-2 border-occ-blue rounded-lg text-xs sm:text-sm font-medium hover:bg-occ-blue hover:occ-secondary-white transition-colors flex items-center gap-2">
                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                Edit
                              </button>
                              <button className="px-3 sm:px-4 py-2 bg-occ-secondary-orange occ-secondary-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
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

          {/* Empty State for Modifications */}
          {modifications.length === 0 && (
            <div className="mt-6 sm:mt-8">
              <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
                <div className="p-8 sm:p-12 text-center">
                  <div className="p-4 sm:p-6 bg-occ-secondary-gray rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                    <Edit3 className="w-10 h-10 sm:w-12 sm:h-12 occ-gray" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold occ-blue-dark mb-2">No Modifications Yet</h3>
                  <p className="text-sm sm:text-base occ-gray mb-6 max-w-md mx-auto leading-relaxed">
                    Start tracking contract modifications by logging your first modification above. 
                    All changes will be analyzed for impact and risk assessment.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-occ-blue occ-secondary-white rounded-lg font-medium hover:bg-occ-blue-dark transition-all shadow-md flex items-center gap-2 mx-auto text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Log Your First Modification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-occ-secondary-white rounded-xl shadow-lg border-2 border-occ-secondary-gray">
              <div className="p-4 sm:p-6 border-b-2 border-occ-secondary-gray bg-occ-blue-dark">
                <h3 className="font-semibold occ-secondary-white flex items-center gap-2 text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Modification Summary
                </h3>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold occ-blue-dark mb-1">
                      {modifications.length}
                    </div>
                    <div className="text-xs sm:text-sm occ-gray">Total Logged</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold occ-blue-dark mb-1">
                      {modifications.filter(m => m.status === 'pending').length}
                    </div>
                    <div className="text-xs sm:text-sm occ-gray">Pending</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold occ-blue-dark mb-1">
                      87%
                    </div>
                    <div className="text-xs sm:text-sm occ-gray">On-time Rate</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-4 bg-occ-secondary-gray rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold occ-blue-dark mb-1">
                      Medium
                    </div>
                    <div className="text-xs sm:text-sm occ-gray">Risk Level</div>
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-occ-blue to-occ-blue-dark rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm sm:text-base font-medium occ-secondary-white">Contract Health Score</span>
                    <span className="text-lg sm:text-xl font-bold occ-secondary-white">8.2/10</span>
                  </div>
                  <div className="w-full bg-occ-secondary-white bg-opacity-20 rounded-full h-2 sm:h-3">
                    <div className="bg-occ-secondary-white h-2 sm:h-3 rounded-full transition-all duration-500" style={{width: '82%'}}></div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm occ-secondary-white opacity-90">
                    Based on modification frequency, risk assessment, and compliance metrics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContractModificationTracker;