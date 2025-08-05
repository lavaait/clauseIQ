import '../occ-colors.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText, 
  DollarSign, 
  Building, 
  Calendar,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  FileCheck,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  Eye,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Star,
  Bookmark,
  X,
  Save,
  AlertTriangle,
  Shield
} from 'lucide-react';

// Get API base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

//export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Edit Modal Component
const EditModal = ({ isOpen, onClose, contract, onSave, isSaving }) => {
  const [editData, setEditData] = useState({
    title: '',
    agency: '',
    contract_type: '',
    value: '',
    status: ''
  });

  useEffect(() => {
    if (contract) {
      setEditData({
        title: contract.title || '',
        agency: contract.agency || '',
        contract_type: contract.contract_type || '',
        value: contract.value || '',
        status: contract.status || ''
      });
    }
  }, [contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(editData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Contract Request
              </h3>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSaving}
                />
              </div>

              {/* Agency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency
                </label>
                <select
                  value={editData.agency}
                  onChange={(e) => setEditData(prev => ({ ...prev, agency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Agency</option>
                  <option value="Department of Commerce">Department of Commerce</option>
                  <option value="Department of Defense">Department of Defense</option>
                  <option value="Department of Justice">Department of Justice</option>
                  <option value="Department of Treasury">Department of Treasury</option>
                </select>
              </div>

              {/* Contract Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Type
                </label>
                <select
                  value={editData.contract_type}
                  onChange={(e) => setEditData(prev => ({ ...prev, contract_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Type</option>
                  <option value="Services">Services</option>
                  <option value="Goods">Goods</option>
                  <option value="Construction">Construction</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Software License">Software License</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  value={editData.value}
                  onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSaving}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Status</option>
                  <option value="intake">Intake</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="approved">Approved</option>
                  <option value="executed">Executed</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, contractTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Contract Request
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete this contract request? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contractTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This contract and all associated data will be permanently removed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                <strong>Warning:</strong> This action is permanent and cannot be reversed. 
                All data associated with this contract will be lost.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Contract
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Success Toast Component
const SuccessToast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-green-700 rounded p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Error Toast Component
const ErrorToast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-red-700 rounded p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Enhanced Status Badge Component
const StatusBadge = ({ status, size = 'default' }) => {
  const statusConfig = {
    intake: {
      color: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
      icon: <FileText className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />,
      label: 'Intake',
      dotColor: 'bg-blue-500'
    },
    evaluation: {
      color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
      icon: <Clock className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />,
      label: 'Evaluation',
      dotColor: 'bg-amber-500'
    },
    approved: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
      icon: <CheckCircle className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />,
      label: 'Approved',
      dotColor: 'bg-emerald-500'
    },
    executed: {
      color: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100',
      icon: <FileCheck className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />,
      label: 'Executed',
      dotColor: 'bg-purple-500'
    }
  };

  const config = statusConfig[status] || statusConfig.intake;
  const sizeClasses = size === 'large' 
    ? 'px-4 py-2.5 text-base gap-2.5' 
    : 'px-3 py-1.5 text-sm gap-2';

  return (
    <div className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border transition-all duration-200 hover:shadow-sm ${config.color}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

// Enhanced Info Card Component
const InfoCard = ({ title, children, className = "", icon, action }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
};

// Enhanced Info Row Component
const InfoRow = ({ icon, label, value, copyable = false, action }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (copyable && value) {
      try {
        await navigator.clipboard.writeText(value.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-150">
      <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900 break-words">
            {value || (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {copyable && value && (
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 rounded transition-colors group"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                )}
              </button>
            )}
            {action}
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Action Button Component
const FloatingActionButton = ({ onClick, icon, label, variant = 'primary' }) => {
  const baseClasses = "fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105 lg:hidden z-50";
  const variants = {
    primary: "bg-occ-blue text-white hover:bg-occ-blue-dark",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
};

const ContractIntakeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast states
  const [successToast, setSuccessToast] = useState({ show: false, message: '' });
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

  // Helper function to extract filename from file path
  const extractFileName = (filePath) => {
    if (!filePath) return null;
    return filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown file';
  };

  // Function to load contract data
  const loadContractData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/new_contract_request/api/contracts_request_list`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Find contract by ID (assuming the API returns contracts with proper IDs)
      const contractData = data.find(item => item.id === parseInt(id)) || data[parseInt(id) - 1];

      if (!contractData) {
        throw new Error('Contract not found');
      }

      // Transform API data - use actual ID if available, otherwise use the index-based ID
      const transformedContract = {
        id: contractData.id || parseInt(id), // Use actual API ID if available
        title: contractData.title,
        agency: contractData.agency,
        contract_type: contractData.contract_type,
        value: contractData.value,
        status: contractData.status,
        created_date: contractData.date ? contractData.date.split('T')[0] : null,
        created_time: contractData.date ? contractData.date.split('T')[1]?.split('.')[0] : null,
        attachment_name: extractFileName(contractData.file_path),
        file_path: contractData.file_path,
        request_number: `CR-${String(contractData.id || parseInt(id)).padStart(6, '0')}` // Use actual ID for request number
      };

      setContract(transformedContract);
      setError(null);
    } catch (err) {
      console.error('Error fetching contract details:', err);
      setError(`Failed to load contract details: ${err.message}`);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadContractData();
      setLoading(false);
    };

    initialLoad();
  }, [id]);

  // Action handlers
  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (editData) => {
    if (!contract) return;

    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/new_contract_request/api/contracts/${contract.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          title: editData.title,
          agency: editData.agency,
          contract_type: editData.contract_type,
          value: parseFloat(editData.value),
          status: editData.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Update local state
      setContract(prev => ({
        ...prev,
        ...editData,
        value: parseFloat(editData.value)
      }));
      
      // Close modal
      setShowEditModal(false);
      
      // Show success message
      setSuccessToast({ show: true, message: 'Contract updated successfully!' });
      
    } catch (error) {
      console.error('Error updating contract:', error);
      setErrorToast({ show: true, message: error.message || 'Failed to update contract' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!contract) return;

    setIsDeleting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/new_contract_request/api/contracts/${contract.id}/delete`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      // Show success message
      setSuccessToast({ show: true, message: 'Contract deleted successfully!' });
      
      // Navigate back to list after a short delay
      setTimeout(() => {
        navigate('/contract-request-list');
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting contract:', error);
      setErrorToast({ show: true, message: error.message || 'Failed to delete contract' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRefresh = async () => {
    await loadContractData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-occ-blue" />
            <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full border-2 border-blue-100"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Contract Details</h3>
          <p className="text-gray-600">Please wait while we fetch the contract information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/contract-request-list')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to List
            </button>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 lg:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Enhanced Header */}
        <div className="bg-occ-blue-gradient rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl mb-6 sm:mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]"></div>
          </div>
          
          <div className="relative">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                {/* Back Button */}
                <button
                  onClick={() => navigate('/contract-request-list')}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 text-sm font-medium group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Contract List
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm mb-3 sm:mb-0 w-fit">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                      {contract?.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {contract?.agency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {contract?.contract_type}
                      </span>
                      <span className="font-mono bg-white/10 px-2 py-1 rounded">
                        #{contract?.request_number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2.5 bg-white text-occ-blue rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium text-sm shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </div>
            </div>

            {/* Status and Value */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-white/20">
              <StatusBadge status={contract?.status} size="large" />
              <div className="mt-3 sm:mt-0 text-right">
                <div className="text-white/80 text-sm">Contract Value</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {contract?.value ? formatCurrency(contract.value) : 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* Basic Information */}
            <InfoCard 
              title="Contract Information"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <InfoRow
                  icon={<Building className="w-5 h-5" />}
                  label="Agency"
                  value={contract?.agency}
                />
                <InfoRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Contract Type"
                  value={contract?.contract_type}
                />
                <InfoRow
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Contract Value"
                  value={contract?.value ? formatCurrency(contract.value) : null}
                  copyable={!!contract?.value}
                />
                <InfoRow
                  icon={<FileText className="w-5 h-5" />}
                  label="Request Number"
                  value={contract?.request_number}
                  copyable
                />
              </div>
            </InfoCard>

            {/* Timeline & Details */}
            <InfoCard 
              title="Timeline Information"
              icon={<Clock className="w-5 h-5 text-blue-600" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <InfoRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Request Date"
                  value={contract?.created_date ? formatDate(contract.created_date) : null}
                />
                <InfoRow
                  icon={<Clock className="w-5 h-5" />}
                  label="Request Time"
                  value={contract?.created_time ? formatTime(contract.created_time) : null}
                />
              </div>
            </InfoCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            
            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Quick Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Request ID</span>
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded text-blue-900">
                    #{contract?.request_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Value</span>
                  <span className="font-semibold text-blue-900">
                    {contract?.value ? formatCurrency(contract.value) : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Type</span>
                  <span className="text-blue-900 font-medium">{contract?.contract_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Status</span>
                  <StatusBadge status={contract?.status} />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <InfoCard 
              title="Attachments"
              icon={<Paperclip className="w-5 h-5 text-blue-600" />}
            >
              {contract?.attachment_name ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {contract.attachment_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Contract Document
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">No attachments available</p>
                  <p className="text-xs text-gray-400 mt-1">Documents will appear here when uploaded</p>
                </div>
              )}
            </InfoCard>

            {/* Actions */}
            <InfoCard 
              title="Actions"
              icon={<Edit className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-occ-blue text-white rounded-lg hover:bg-occ-blue-dark transition-all flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit Request
                </button>
                
                <hr className="my-4 border-gray-200" />
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Request
                </button>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton
        onClick={handleEdit}
        icon={<Edit className="w-6 h-6" />}
        label="Edit Contract"
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        contract={contract}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        contractTitle={contract?.title || ''}
        isDeleting={isDeleting}
      />

      {/* Success Toast */}
      <SuccessToast
        message={successToast.message}
        isVisible={successToast.show}
        onClose={() => setSuccessToast({ show: false, message: '' })}
      />

      {/* Error Toast */}
      <ErrorToast
        message={errorToast.message}
        isVisible={errorToast.show}
        onClose={() => setErrorToast({ show: false, message: '' })}
      />
    </div>
  );
};

export default ContractIntakeDetail;