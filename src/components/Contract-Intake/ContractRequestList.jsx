import '../occ-colors.css';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  DollarSign, 
  Building, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCheck,
  X,
  MoreVertical
} from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';

// Mock data - replace with actual API call
const mockContractRequests = [
  {
    id: 1,
    title: "Software Development Services",
    agency: "Department of Technology",
    contract_type: "Services",
    value: 250000.00,
    status: "intake",
    created_date: "2024-03-15",
    attachment_name: "requirements.pdf"
  },
  {
    id: 2,
    title: "Office Equipment Purchase",
    agency: "Administrative Services",
    contract_type: "Goods",
    value: 75000.00,
    status: "evaluation",
    created_date: "2024-03-14",
    attachment_name: "equipment_specs.xlsx"
  },
  {
    id: 3,
    title: "Building Maintenance Contract",
    agency: "Facilities Management",
    contract_type: "Maintenance",
    value: 180000.00,
    status: "approved",
    created_date: "2024-03-12",
    attachment_name: "maintenance_scope.docx"
  },
  {
    id: 4,
    title: "Consulting Services - Strategic Planning",
    agency: "Executive Office",
    contract_type: "Consulting",
    value: 95000.00,
    status: "executed",
    created_date: "2024-03-10",
    attachment_name: "consulting_proposal.pdf"
  },
  {
    id: 5,
    title: "Construction Project - Phase 1",
    agency: "Public Works",
    contract_type: "Construction",
    value: 500000.00,
    status: "intake",
    created_date: "2024-03-08",
    attachment_name: "construction_plans.pdf"
  },
  {
    id: 6,
    title: "Professional Services Agreement",
    agency: "Human Resources",
    contract_type: "Professional Services",
    value: 45000.00,
    status: "evaluation",
    created_date: "2024-03-05",
    attachment_name: "service_agreement.docx"
  }
];

// Status Badge Component - Enhanced Responsive
const StatusBadge = ({ status }) => {
  const statusConfig = {
    intake: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
      label: 'Intake'
    },
    evaluation: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
      label: 'Evaluation'
    },
    approved: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
      label: 'Approved'
    },
    executed: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <FileCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
      label: 'Executed'
    }
  };

  const config = statusConfig[status] || statusConfig.intake;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      <span className="hidden xs:inline sm:inline">{config.label}</span>
    </span>
  );
};

// Action Menu Component - Enhanced Responsive
const ActionMenu = ({ request, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-10 sm:top-12 z-20 w-36 sm:w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => {
                onView(request);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 touch-manipulation"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onEdit(request);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 touch-manipulation"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(request);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2 touch-manipulation"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Enhanced Mobile Card Component
const MobileCard = ({ request, onView, onEdit, onDelete }) => {
  const formatCompactCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 leading-tight">
            {request.title}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <Download className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-xs">{request.attachment_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <StatusBadge status={request.status} />
          <ActionMenu
            request={request}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-2.5">
        {/* Agency */}
        <div className="flex items-center gap-2 min-w-0">
          <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">{request.agency}</span>
        </div>
        
        {/* Type and Value Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700 truncate">{request.contract_type}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {formatCompactCurrency(request.value)}
            </span>
          </div>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(request.created_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-xs text-gray-400">#{request.id}</span>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component for Cards
const MobileCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 pr-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-2.5">
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
  </div>
);

// Loading Skeleton Component for Table Rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </td>
    <td className="px-4 lg:px-6 py-3 lg:py-4">
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </td>
  </tr>
);

// Enhanced Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      contractType: '',
      dateRange: '',
      minValue: '',
      maxValue: ''
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              Filter Contracts
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close filters"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="intake">Intake</option>
                <option value="evaluation">Evaluation</option>
                <option value="approved">Approved</option>
                <option value="executed">Executed</option>
              </select>
            </div>

            {/* Contract Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
              <select
                value={localFilters.contractType}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, contractType: e.target.value }))}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="Services">Services</option>
                <option value="Goods">Goods</option>
                <option value="Construction">Construction</option>
                <option value="Consulting">Consulting</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Software License">Software License</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>

            {/* Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Value Range</label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="number"
                  placeholder="Min value"
                  value={localFilters.minValue}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minValue: e.target.value }))}
                  className="px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Max value"
                  value={localFilters.maxValue}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                  className="px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={localFilters.dateRange}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation text-sm font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={handleApply}
              className="w-full px-4 py-3 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors touch-manipulation text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Initial page load
  const [listLoading, setListLoading] = useState(false); // List refresh only
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    contractType: '',
    dateRange: '',
    minValue: '',
    maxValue: ''
  });

  // Function to load data
  const loadData = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequests(mockContractRequests);
      setError(null);
    } catch (err) {
      setError('Failed to load contract requests');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };

    initialLoad();
  }, []);

  // Filter and search logic
  const filteredRequests = requests.filter(request => {
    // Search filter
    const matchesSearch = !searchTerm || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contract_type.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || request.status === filters.status;

    // Contract type filter
    const matchesType = !filters.contractType || request.contract_type === filters.contractType;

    // Value range filter
    const matchesMinValue = !filters.minValue || request.value >= parseFloat(filters.minValue);
    const matchesMaxValue = !filters.maxValue || request.value <= parseFloat(filters.maxValue);

    return matchesSearch && matchesStatus && matchesType && matchesMinValue && matchesMaxValue;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Action handlers
  const handleView = (request) => {
    console.log('View request:', request);
    // Navigate to detail view
  };

  const handleEdit = (request) => {
    console.log('Edit request:', request);
    // Navigate to edit form
  };

  const handleDelete = (request) => {
    if (window.confirm('Are you sure you want to delete this contract request?')) {
      setRequests(prev => prev.filter(r => r.id !== request.id));
    }
  };

  // Modified refresh handler - only refreshes list data
  const handleRefresh = async () => {
    setListLoading(true);
    await loadData();
    setListLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show full page loading only on initial load
  if (loading) {
    return (
      <MainLayout title="Contract Request List" userRole="Contract Manager">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-blue-600" />
            <p className="text-gray-600 text-sm sm:text-base">Loading contract requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Contract Request List" userRole="Contract Manager">
      <div className="min-h-screen pb-4 sm:pb-6 lg:pb-8">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          
          {/* Header - Always Visible */}
          <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                  <span className="truncate">Contract Requests</span>
                </h1>
                <p className="text-white mt-1 sm:mt-2 opacity-90 text-xs sm:text-sm md:text-base">
                  Manage and track all contract requests in the system
                </p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={listLoading}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2 disabled:opacity-50 touch-manipulation text-xs sm:text-sm font-medium min-h-[44px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${listLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                
                <button
                  onClick={() => window.location.href = '/new-contract-request'}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-occ-blue rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium touch-manipulation text-xs sm:text-sm min-h-[44px]"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">New Request</span>
                  <span className="xs:hidden">New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters - Always Visible */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, agency, or contract type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  disabled={listLoading}
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                disabled={listLoading}
                className="px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base font-medium min-h-[44px] whitespace-nowrap disabled:opacity-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.values(filters).some(v => v !== '') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Results Summary */}
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              {listLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Refreshing...</span>
                </div>
              ) : (
                <>
                  Showing <span className="font-medium">{paginatedRequests.length}</span> of <span className="font-medium">{filteredRequests.length}</span> contract requests
                </>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base">{error}</span>
            </div>
          )}

          {/* Mobile/Tablet Cards (shown below xl) */}
          <div className="block xl:hidden">
            {listLoading ? (
              // Loading state for cards
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array(itemsPerPage).fill(0).map((_, index) => (
                  <MobileCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {paginatedRequests.map((request) => (
                  <MobileCard
                    key={request.id}
                    request={request}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              /* Mobile Empty State */
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No contract requests found</h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm">
                  {searchTerm || Object.values(filters).some(v => v !== '')
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first contract request.'
                  }
                </p>
                <button
                  onClick={() => window.location.href = '/new-contract-request'}
                  className="px-4 py-3 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors flex items-center gap-2 mx-auto touch-manipulation text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create New Request
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table (shown on xl and above) */}
          <div className="hidden xl:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract Details
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listLoading ? (
                    // Loading state for table
                    Array(itemsPerPage).fill(0).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">{request.title}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Download className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{request.attachment_name}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{request.agency}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900">{request.contract_type}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(request.value)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-500">
                          {formatDate(request.created_date)}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <ActionMenu
                            request={request}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    ))
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Desktop Empty State */}
            {!listLoading && filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contract requests found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || Object.values(filters).some(v => v !== '')
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first contract request.'
                  }
                </p>
                <button
                  onClick={() => window.location.href = '/new-contract-request'}
                  className="px-4 py-2 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create New Request
                </button>
              </div>
            )}
          </div>

          {/* Pagination - Always Visible when applicable */}
          {!listLoading && totalPages > 1 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 mt-3 sm:mt-4 md:mt-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              {/* Mobile Pagination */}
              <div className="flex sm:hidden items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 touch-manipulation min-h-[44px] text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                
                <span className="text-sm text-gray-700 font-medium">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 touch-manipulation min-h-[44px] text-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredRequests.length)}</span> of <span className="font-medium">{filteredRequests.length}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 sm:py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">Previous</span>
                    <span className="md:hidden">Prev</span>
                  </button>
                  
                  <span className="text-xs sm:text-sm text-gray-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 sm:py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <span className="hidden md:inline">Next</span>
                    <span className="md:hidden">Next</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={(appliedFilters) => {
          setCurrentPage(1); // Reset to first page when filters change
        }}
      />
    </MainLayout>
  );
};

export default ContractRequestList;