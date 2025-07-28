import '../occ-colors.css';
import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, DollarSign, FileCheck, Calendar, Building, FileSpreadsheet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';

// Toast Notification Component
const Toast = ({ show, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

return (
  <>
    {/* Backdrop for mobile */}
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className={`
        fixed top-4 left-4 right-4 sm:right-4 sm:left-auto sm:w-96 
        transform transition-all duration-500 ease-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className={`
          rounded-lg shadow-lg border-r-4 p-4 pointer-events-auto
          ${type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : 'bg-red-50 border-red-400 text-red-800'
          }
          backdrop-blur-sm bg-opacity-95
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}
              `}>
                {type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {type === 'success' ? 'Success!' : 'Error!'}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`
                flex-shrink-0 ml-4 p-1 rounded-full transition-colors
                ${type === 'success' 
                  ? 'text-green-600 hover:bg-green-100' 
                  : 'text-red-600 hover:bg-red-100'
                }
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className={`
            mt-3 h-1 bg-opacity-20 rounded-full overflow-hidden
            ${type === 'success' ? 'bg-green-200' : 'bg-red-200'}
          `}>
            <div 
              className={`
                h-full transition-all duration-5000 ease-linear
                ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
                ${show ? 'w-0' : 'w-full'}
              `}
              style={{
                animation: show ? 'shrink 5s linear forwards' : 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
    
    {/* Add keyframes for progress bar animation */}
    <style jsx>{`
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `}</style>
  </>
);
};

// API configuration
const API_BASE_URL = 'http://3.95.95.62:8006';
const API_ENDPOINTS = {
  submitContract: '/api/new_contract_request/contracts/submit'
};

const NewContractRequestForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    agency: '',
    contractType: '',
    value: '',
    status: 'intake',
    attachment: null 
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Toast notification states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
   
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null);
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileUpload = (files) => {
    const file = files[0];
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setSubmitError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Please upload a PDF, DOC, DOCX, XLS, or XLSX file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        attachment: {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        }
      }));

      // Clear any previous errors
      if (submitError) setSubmitError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Contract title is required';
    }

    if (!formData.agency.trim()) {
      errors.agency = 'Agency/Organization is required';
    }

    if (!formData.contractType) {
      errors.contractType = 'Contract type is required';
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      errors.value = 'Contract value must be greater than 0';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    if (!formData.attachment) {
      errors.attachment = 'Document upload is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // API submission function
  const submitContractRequest = async (data) => {
    const formDataToSend = new FormData();
    
    // Append all required fields according to API documentation
    formDataToSend.append('title', data.title.trim());
    formDataToSend.append('agency', data.agency.trim());
    formDataToSend.append('contract_type', data.contractType);
    formDataToSend.append('value', parseFloat(data.value));
    formDataToSend.append('status', data.status);
    
    if (data.attachment && data.attachment.file) {
      formDataToSend.append('file', data.attachment.file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.submitContract}`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          console.error('Detailed validation errors:', errorData);
          
          // Create user-friendly error message
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const errorMessages = errorData.detail.map(err => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown field';
              return `${field}: ${err.msg}`;
            });
            throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
          } else {
            throw new Error('Validation error occurred. Please check your input data.');
          }
        } else if (response.status === 413) {
          throw new Error('File size too large. Please upload a smaller file.');
        } else if (response.status === 415) {
          throw new Error('Unsupported file type. Please upload a PDF, DOC, DOCX, XLS, or XLSX file.');
        } else {
          const errorText = await response.text();
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API submission error:', error);
      throw error;
    }
  };

  // Show success toast
  const showSuccessNotification = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
  };

  // Show error toast
  const showErrorNotification = (message) => {
    setToastMessage(message);
    setShowErrorToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSubmitError('Please correct the errors below and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitContractRequest(formData);
      
      console.log('Contract request submitted successfully:', result);
      
      // Show success toast notification
      showSuccessNotification('Your contract request has been submitted successfully and is now under review.');
      
      // Reset form
      setFormData({
        title: '',
        agency: '',
        contractType: '',
        value: '',
        status: 'intake',
        attachment: null
      });
      setValidationErrors({});
      
    } catch (error) {
      console.error('Error submitting contract request:', error);
      const errorMessage = error.message || 'Failed to submit contract request. Please try again.';
      setSubmitError(errorMessage);
      showErrorNotification(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="New Contract Request" userRole="Contract Intake">
      {/* Toast Notifications */}
      <Toast 
        show={showSuccessToast} 
        message={toastMessage}
        type="success"
        onClose={() => setShowSuccessToast(false)} 
      />
      <Toast 
        show={showErrorToast} 
        message={toastMessage}
        type="error"
        onClose={() => setShowErrorToast(false)} 
      />

      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Card */}
          <div className="bg-occ-blue-gradient rounded-t-xl p-6 shadow-lg">
            <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white flex items-center gap-3">
              <FileCheck className="w-7 h-7" />
              New Contract Request
            </h2>
            <p className="occ-secondary-white mt-2">
              Fill out the form below to submit a new contract request for review.
            </p>
          </div>

          {/* Error Alert - Keep this for form validation errors */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-lg p-8">
            <div className="space-y-8">
              {/* First row with two inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contract Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 occ-blue" />
                    Contract Title <span className="occ-secondary-orange">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter contract title"
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Agency */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4 occ-blue" />
                    Agency/Organization <span className="occ-secondary-orange">*</span>
                  </label>
                  <input
                    type="text"
                    name="agency"
                    value={formData.agency}
                    onChange={handleInputChange}
                    placeholder="Enter agency or organization name"
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.agency ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.agency && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.agency}
                    </p>
                  )}
                </div>
              </div>

              {/* Second row with three inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contract Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 occ-blue" />
                    Contract Type <span className="occ-secondary-orange">*</span>
                  </label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.contractType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Contract Type</option>
                    <option value="Services">Services</option>
                    <option value="Goods">Goods</option>
                    <option value="Construction">Construction</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Software License">Software License</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                  {validationErrors.contractType && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.contractType}
                    </p>
                  )}
                </div>

                {/* Contract Value */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 occ-blue" />
                    Contract Value <span className="occ-secondary-orange">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        validationErrors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.value && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.value}
                    </p>
                  )}
                </div>

                {/* Status Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 occ-blue" />
                    Status <span className="occ-secondary-orange">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      validationErrors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Status</option>
                    <option value="intake">Intake</option>
                    <option value="evaluation">Evaluation</option>
                    <option value="approved">Approved</option>
                    <option value="executed">Executed</option>
                  </select>
                  {validationErrors.status && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.status}
                    </p>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 occ-blue" />
                  Document Upload <span className="text-sm font-normal text-gray-500">(Required)</span>
                </h3>

                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    dragActive 
                      ? 'border-occ-blue bg-occ-secondary-gray' 
                      : validationErrors.attachment 
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-occ-blue hover:bg-gray-50'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2 font-medium">
                    Drag and drop a file here, or{' '}
                    <label className={`occ-blue hover:text-occ-blue-dark cursor-pointer underline ${isSubmitting ? 'pointer-events-none' : ''}`}>
                      browse
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        disabled={isSubmitting}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for PDF, DOC, DOCX, XLS, XLSX files up to 10MB
                  </p>
                </div>

                {validationErrors.attachment && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.attachment}
                  </p>
                )}

                {/* File Display */}
                {formData.attachment && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 occ-blue" />
                      Uploaded File
                    </h4>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-occ-secondary-gray rounded-md">
                          <FileText className="w-5 h-5 occ-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formData.attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(formData.attachment.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        disabled={isSubmitting}
                        className="p-1.5 bg-white text-gray-500 hover:occ-secondary-orange rounded-full border border-gray-200 hover:border-occ-secondary-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-8 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-occ-blue occ-secondary-white font-medium rounded-lg hover:bg-occ-blue-dark focus:ring-4 focus:ring-occ-blue focus:ring-opacity-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewContractRequestForm;