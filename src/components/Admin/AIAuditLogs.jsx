import React, { useState } from 'react';
import { Download, Search, Filter, ChevronDown, Eye, AlertTriangle, CheckCircle, Clock, TrendingUp, Menu, X } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const AIAuditLogs = () => {
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: '2025-01-20 14:30:22',
      user: 'John Doe',
      action: 'Contract Risk Assessment',
      aiDecision: 'High Risk - Recommend Legal Review',
      confidence: 89,
      details: 'Unusual termination clauses detected',
      category: 'risk'
    },
    {
      id: 2,
      timestamp: '2025-01-20 13:45:11',
      user: 'Alice Smith',
      action: 'Document Classification',
      aiDecision: 'Category: Master Service Agreement',
      confidence: 95,
      details: 'Standard MSA template identified',
      category: 'classification'
    },
    {
      id: 3,
      timestamp: '2025-01-20 12:15:33',
      user: 'Bob Johnson',
      action: 'Vendor Evaluation',
      aiDecision: 'Approved - Low Risk Vendor',
      confidence: 78,
      details: 'Financial stability confirmed',
      category: 'approval'
    },
    {
      id: 4,
      timestamp: '2025-01-20 11:20:44',
      user: 'John Doe',
      action: 'Compliance Check',
      aiDecision: 'Non-compliant - GDPR Issues',
      confidence: 92,
      details: 'Data processing clauses missing',
      category: 'compliance'
    },
    {
      id: 5,
      timestamp: '2025-01-20 10:30:15',
      user: 'Carol White',
      action: 'Price Analysis',
      aiDecision: '15% Above Market Rate',
      confidence: 82,
      details: 'Competitor pricing analysis completed',
      category: 'analysis'
    },
    {
      id: 6,
      timestamp: '2025-01-20 09:45:33',
      user: 'Alice Smith',
      action: 'Contract Risk Assessment',
      aiDecision: 'Medium Risk - Review Recommended',
      confidence: 76,
      details: 'Payment terms require attention',
      category: 'risk'
    },
    {
      id: 7,
      timestamp: '2025-01-20 09:12:18',
      user: 'Bob Johnson',
      action: 'Document Classification',
      aiDecision: 'Category: Non-Disclosure Agreement',
      confidence: 98,
      details: 'Standard NDA format detected',
      category: 'classification'
    },
    {
      id: 8,
      timestamp: '2025-01-20 08:55:07',
      user: 'John Doe',
      action: 'Vendor Evaluation',
      aiDecision: 'Pending Review - Insufficient Data',
      confidence: 45,
      details: 'Missing financial documentation',
      category: 'pending'
    }
  ]);

  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const roles = ['Contract Manager', 'Legal', 'Procurement Officer', 'Admin'];
  const actions = ['Contract Risk Assessment', 'Document Classification', 'Vendor Evaluation', 'Compliance Check', 'Price Analysis'];

  const userRoles = {
    'John Doe': 'Contract Manager',
    'Alice Smith': 'Legal',
    'Bob Johnson': 'Procurement Officer',
    'Carol White': 'Admin'
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = !filterRole || userRoles[log.user] === filterRole;
    const matchesAction = !filterAction || log.action === filterAction;
    const matchesSearch = !searchTerm || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.aiDecision.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesAction && matchesSearch;
  });

  const downloadCSV = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'AI Decision', 'Confidence %', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.aiDecision,
        log.confidence,
        log.details
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusConfig = (decision) => {
    if (decision.includes('High Risk') || decision.includes('Non-compliant')) {
      return {
        classes: 'bg-red-50 text-red-800 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    }
    if (decision.includes('Approved') || decision.includes('Low Risk')) {
      return {
        classes: 'bg-green-50 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    }
    if (decision.includes('Pending') || decision.includes('Insufficient')) {
      return {
        classes: 'bg-gray-50 text-gray-800 border-gray-200',
        icon: Clock,
        iconColor: 'text-gray-600'
      };
    }
    return {
      classes: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: TrendingUp,
      iconColor: 'text-yellow-600'
    };
  };

  const getConfidenceBarClass = (confidence) => {
    if (confidence >= 80) return 'bg-occ-blue';
    if (confidence >= 60) return 'bg-occ-yellow';
    return 'bg-occ-secondary-orange';
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const stats = [
    { label: 'Total Decisions', value: auditLogs.length, icon: TrendingUp },
    { label: 'High Confidence', value: auditLogs.filter(log => log.confidence >= 80).length, icon: CheckCircle },
    { label: 'Risk Alerts', value: auditLogs.filter(log => log.aiDecision.includes('High Risk')).length, icon: AlertTriangle },
    { label: 'Avg Confidence', value: `${Math.round(auditLogs.reduce((sum, log) => sum + log.confidence, 0) / auditLogs.length)}%`, icon: TrendingUp }
  ];

  return (
    <MainLayout title='Audit Export Logs'>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
       
        <div className="block lg:hidden sticky top-0 z-20 bg-white shadow-md border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold occ-blue-dark">
              AI Audit Logs
            </h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowMobileMenu(false);
                  }}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Filter size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button
                  onClick={() => {
                    downloadCSV();
                    setShowMobileMenu(false);
                  }}
                  className="p-3 bg-occ-yellow rounded-lg flex items-center gap-2 text-sm font-semibold occ-blue-dark"
                >
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 leading-tight">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-3xl font-bold occ-blue-dark">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-2 lg:p-3 bg-occ-blue rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                    <stat.icon size={16} className="text-white lg:w-5 lg:h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
           
            <div className="hidden lg:block p-8 border-b border-gray-200 bg-occ-blue-gradient rounded-t-2xl">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    AI Audit Logs
                  </h1>
                  <p className="text-white/80 text-base">
                    Track and analyze AI decision-making processes
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-white/10 border border-white/30 text-white rounded-xl text-sm font-semibold flex items-center gap-2 backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    <Filter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="px-6 py-3 bg-occ-yellow occ-blue-dark rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
                  >
                    <Download size={16} />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-4 lg:p-8 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3.5 w-full border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-occ-blue focus:border-occ-blue"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-3.5 pr-12 w-full border-2 border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-occ-blue focus:border-occ-blue"
                    >
                      <option value="">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                  <div className="relative">
                    <select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      className="px-4 py-3.5 pr-12 w-full border-2 border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-occ-blue focus:border-occ-blue"
                    >
                      <option value="">All Actions</option>
                      {actions.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            )}

          
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      AI Decision
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold occ-blue-dark uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => {
                      const statusConfig = getStatusConfig(log.aiDecision);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr 
                          key={log.id} 
                          className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                          onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">
                            <div>
                              {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-occ-blue-gradient rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {log.user.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold occ-blue-dark">
                                  {truncateText(log.user, 15)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {truncateText(userRoles[log.user], 12)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">
                            <div title={log.action}>
                              {truncateText(log.action, 20)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusConfig.classes}`}>
                              <StatusIcon size={12} />
                              <span title={log.aiDecision}>
                                {truncateText(log.aiDecision, 25)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${getConfidenceBarClass(log.confidence)}`}
                                  style={{ width: `${log.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-600">
                                {log.confidence}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div 
                              className={`text-sm text-gray-500 max-w-[180px] ${
                                selectedLog === log.id ? 'whitespace-normal' : 'truncate'
                              }`} 
                              title={log.details}
                            >
                              {selectedLog === log.id ? log.details : truncateText(log.details, 25)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Search size={48} className="mx-auto mb-4 opacity-50" />
                          No matching audit logs found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="block lg:hidden p-4">
              {filteredLogs.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.aiDecision);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-occ-blue-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {log.user.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold occ-blue-dark">
                                {log.user}
                              </div>
                              <div className="text-xs text-gray-500">
                                {userRoles[log.user]}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                            className="p-1 flex-shrink-0"
                          >
                            <Eye size={16} className="text-gray-400" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            {log.action}
                          </div>
                          <div className="text-xs text-gray-400">
                            {log.timestamp}
                          </div>
                        </div>

                        {/* Decision Badge */}
                        <div className="mb-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusConfig.classes}`}>
                            <StatusIcon size={12} />
                            {log.aiDecision}
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Confidence</span>
                            <span className="text-sm font-semibold text-gray-600">
                              {log.confidence}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getConfidenceBarClass(log.confidence)}`}
                              style={{ width: `${log.confidence}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Details */}
                        {selectedLog === log.id && (
                          <div className="pt-3 border-t border-gray-200 text-sm text-gray-500 leading-relaxed">
                            <strong className="text-gray-600">Details:</strong><br />
                            {log.details}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                  <div className="text-gray-500">
                    No matching audit logs found
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <p className="text-sm font-medium text-gray-600">
                Showing <span className="font-bold occ-blue-dark">{filteredLogs.length}</span> of <span className="font-bold occ-blue-dark">{auditLogs.length}</span> audit log entries
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIAuditLogs;