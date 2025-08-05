import React, { useState, useRef } from 'react';
import { Upload, FileText, X, FileCheck, Loader2, AlertCircle, Check, ArrowDown, Download, Share, Copy, Save, XCircle, Send, CheckCircle } from 'lucide-react';
import '../occ-colors.css';

// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_ENDPOINTS = {
  uploadAndSummarize: '/api/proposal_summary/upload-and-summarize/',
  saveEvaluation: '/api/proposal_evaluation/save/',
  submitEvaluation: '/api/proposal_evaluation/submit/'
};

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_FILES = 10; // Reasonable limit for simultaneous uploads

// Toast Notification Component
const Toast = ({ show, message, type = 'success', onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        rounded-lg shadow-lg border-l-4 p-4 transition-all duration-500 ease-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${type === 'success' 
          ? 'bg-green-50 border-green-400 text-green-800' 
          : type === 'error'
          ? 'bg-red-50 border-red-400 text-red-800'
          : 'bg-blue-50 border-blue-400 text-blue-800'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
              ${type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100'}
            `}>
              {type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <FileCheck className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`
              flex-shrink-0 ml-4 p-1 rounded-full transition-colors
              ${type === 'success' 
                ? 'text-green-600 hover:bg-green-100' 
                : type === 'error'
                ? 'text-red-600 hover:bg-red-100'
                : 'text-blue-600 hover:bg-blue-100'
              }
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProposalUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileSummaries, setFileSummaries] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationSaved, setEvaluationSaved] = useState(false);
  const [evaluationSubmitted, setEvaluationSubmitted] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  const fileInputRef = useRef(null);
  const analysisRef = useRef(null);

  // Show toast notification
  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // File validation function
  const validateFile = (file) => {
    const errors = [];
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push('Only PDF files are supported');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
    }
    
    if (file.size === 0) {
      errors.push('File cannot be empty');
    }
    
    return errors;
  };

  // API call to upload and get summary
  const uploadAndSummarize = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.uploadAndSummarize}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          const errorMessages = errorData.detail?.map(err => err.msg).join(', ') || 'Validation error';
          throw new Error(`Validation Error: ${errorMessages}`);
        } else if (response.status === 413) {
          throw new Error('File too large. Maximum size is 50MB.');
        } else if (response.status === 415) {
          throw new Error('Unsupported file type. Please upload a PDF file.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${errorText || `Error ${response.status}`}`);
        }
      }

      const result = await response.json();
      
      let summary;
      
      if (typeof result === 'string') {
        summary = result;
      } else if (result && typeof result === 'object') {
        summary = result.summary || 
                  result.text || 
                  result.content || 
                  result.message || 
                  result.data ||
                  JSON.stringify(result);
      } else {
        throw new Error(`Unexpected response format: ${typeof result}`);
      }
      
      if (!summary || (typeof summary === 'string' && summary.trim().length === 0)) {
        throw new Error('Empty or invalid summary received from server');
      }
      
      return summary;
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (error.name === 'SyntaxError') {
        throw new Error('Invalid response format from server. Please try again.');
      }
      
      throw error;
    }
  };

  // Save evaluation as draft
  const saveEvaluation = async () => {
    setIsSaving(true);
    
    try {
      const evaluationData = {
        files: uploadedFiles.filter(f => f.uploadStatus === 'completed').map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          summary: fileSummaries[file.id]
        })),
        status: 'draft',
        savedAt: new Date().toISOString()
      };

      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.saveEvaluation}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(evaluationData)
      // });
      
      setEvaluationSaved(true);
      showNotification('Evaluation saved as draft successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving evaluation:', error);
      showNotification('Failed to save evaluation. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit evaluation
  const submitEvaluation = async () => {
    setIsSubmitting(true);
    
    try {
      const evaluationData = {
        files: uploadedFiles.filter(f => f.uploadStatus === 'completed').map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          summary: fileSummaries[file.id]
        })),
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation:
      // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.submitEvaluation}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(evaluationData)
      // });
      
      setEvaluationSubmitted(true);
      setEvaluationSaved(true);
      showNotification('Evaluation submitted successfully!', 'success');
      
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      showNotification('Failed to submit evaluation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel evaluation
  const cancelEvaluation = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setUploadedFiles([]);
      setFileSummaries({});
      setShowAnalysis(false);
      setEvaluationSaved(false);
      setEvaluationSubmitted(false);
      setGlobalError(null);
      showNotification('Evaluation cancelled', 'info');
    }
  };

  const handleFileUpload = async (files) => {
    setGlobalError(null);

    if (uploadedFiles.length + files.length > MAX_FILES) {
      setGlobalError(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      const errors = validateFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors });
      }
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.join(', ')}`
      ).join('\n');
      setGlobalError(`File validation errors:\n${errorMessages}`);
    }

    if (validFiles.length === 0) {
      return;
    }

    const duplicateFiles = validFiles.filter(file => 
      uploadedFiles.some(uploaded => uploaded.name === file.name && uploaded.size === file.size)
    );

    if (duplicateFiles.length > 0) {
      const duplicateNames = duplicateFiles.map(f => f.name).join(', ');
      setGlobalError(`Duplicate files detected: ${duplicateNames}`);
      return;
    }

    for (const file of validFiles) {
      const fileObj = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadStatus: 'uploading',
        uploadProgress: 0
      };

      setUploadedFiles(prev => [...prev, fileObj]);

      try {
        const summary = await uploadAndSummarize(file);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadStatus: 'completed', uploadProgress: 100 }
              : f
          )
        );
        
        setFileSummaries(prev => ({
          ...prev,
          [fileObj.id]: summary
        }));
        
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadStatus: 'error', error: error.message }
              : f
          )
        );
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setFileSummaries(prev => {
      const newSummaries = { ...prev };
      delete newSummaries[fileId];
      return newSummaries;
    });
    
    if (uploadedFiles.length === 1) {
      setGlobalError(null);
      setShowAnalysis(false);
    }
  };

  const retryUpload = async (fileId) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, uploadStatus: 'uploading', error: null }
          : f
      )
    );

    try {
      const summary = await uploadAndSummarize(file.file);
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, uploadStatus: 'completed' }
            : f
        )
      );
      
      setFileSummaries(prev => ({
        ...prev,
        [fileId]: summary
      }));
      
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, uploadStatus: 'error', error: error.message }
            : f
        )
      );
    }
  };

   const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileStatusIcon = (file) => {
    if (file.uploadStatus === 'uploading') {
      return <Loader2 size={16} className="animate-spin occ-blue" />;
    } else if (file.uploadStatus === 'completed') {
      return <Check size={16} className="text-green-600" />;
    } else if (file.uploadStatus === 'error') {
      return <AlertCircle size={16} className="text-red-600" />;
    }
    return null;
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setFileSummaries({});
    setGlobalError(null);
    setShowAnalysis(false);
    setEvaluationSaved(false);
    setEvaluationSubmitted(false);
  };

  const viewAnalysis = () => {
    const completedFiles = uploadedFiles.filter(f => f.uploadStatus === 'completed');
    
    if (uploadedFiles.length === 0) {
      setGlobalError('Please upload at least one proposal');
      return;
    }

    if (completedFiles.length === 0) {
      setGlobalError('Please wait for file processing to complete');
      return;
    }

    setShowAnalysis(true);
    
    // Smooth scroll to analysis section
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const copyAllSummaries = () => {
    const completedFiles = uploadedFiles.filter(f => f.uploadStatus === 'completed');
    const allSummaries = completedFiles
      .map((file, index) => `${index + 1}. ${file.name}\n${fileSummaries[file.id] || 'No summary available'}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(allSummaries);
    showNotification('All summaries copied to clipboard!', 'success');
  };

  const copyIndividualSummary = (fileId, fileName) => {
    const summary = fileSummaries[fileId];
    if (summary) {
      navigator.clipboard.writeText(`${fileName}\n\n${summary}`);
      showNotification('Summary copied to clipboard!', 'success');
    }
  };

  const completedCount = uploadedFiles.filter(f => f.uploadStatus === 'completed').length;
  const uploadingCount = uploadedFiles.filter(f => f.uploadStatus === 'uploading').length;
  const errorCount = uploadedFiles.filter(f => f.uploadStatus === 'error').length;
  const completedFiles = uploadedFiles.filter(f => f.uploadStatus === 'completed');

  return (
    <>
      {/* Toast Notification */}
      <Toast 
        show={showToast} 
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)} 
      />

      <div className="pb-4 sm:pb-6 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileCheck className="w-6 h-6 sm:w-8 sm:h-8 occ-secondary-white" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">Proposal Summary Generator</h1>
            </div>
            <p className="occ-secondary-white opacity-90 text-sm sm:text-base">Upload PDF proposals to generate AI-powered summaries</p>
          </div>

          {/* Global Error Alert */}
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="whitespace-pre-line text-sm">{globalError}</p>
                <button 
                  onClick={() => setGlobalError(null)}
                  className="text-red-600 hover:text-red-800 underline text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* File Upload */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium occ-blue-dark flex items-center gap-2">
                    <Upload className="w-4 h-4 occ-blue" />
                    Upload Proposal PDFs <span className="occ-secondary-orange">*</span>
                  </label>
                  {uploadedFiles.length > 0 && (
                    <button
                      onClick={clearAllFiles}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                      disabled={uploadingCount > 0}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${
                    isDragOver
                      ? 'border-occ-blue bg-occ-secondary-gray'
                      : 'border-occ-gray hover:border-occ-blue hover:bg-occ-secondary-gray'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload size={32} className="sm:w-12 sm:h-12 mx-auto mb-4 occ-gray" />
                  <p className="text-sm sm:text-base lg:text-lg font-medium occ-blue-dark mb-2">
                    Drag and drop PDF files here or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="occ-blue hover:occ-blue-dark underline font-medium transition-colors"
                      disabled={uploadingCount > 0}
                    >
                      Browse
                    </button>
                  </p>
                  <p className="text-xs sm:text-sm occ-gray">
                    Only PDF files are supported (up to {formatFileSize(MAX_FILE_SIZE)} each, max {MAX_FILES} files)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploadingCount > 0}
                />

                {/* Upload Summary */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">✓ {completedCount} completed</span>
                      {uploadingCount > 0 && <span className="text-blue-600">⏳ {uploadingCount} uploading</span>}
                      {errorCount > 0 && <span className="text-red-600">✗ {errorCount} failed</span>}
                    </div>
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium occ-blue-dark mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 occ-blue" />
                      Uploaded Files ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className="border border-occ-secondary-gray rounded-lg overflow-hidden">
                          {/* File Header */}
                          <div className="flex items-center justify-between p-4 bg-occ-secondary-gray">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-occ-secondary-white rounded-md flex-shrink-0 border border-occ-secondary-gray">
                                <FileText size={18} className="occ-blue" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium occ-blue-dark truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs occ-gray">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getFileStatusIcon(file)}
                              {file.uploadStatus === 'error' && (
                                <button
                                  onClick={() => retryUpload(file.id)}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Retry
                                </button>
                              )}
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-1.5 bg-occ-secondary-white occ-gray hover:occ-secondary-orange rounded-full border-2 border-occ-secondary-gray hover:border-occ-secondary-orange transition-all flex-shrink-0"
                                disabled={file.uploadStatus === 'uploading'}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Error Display */}
                          {file.uploadStatus === 'error' && (
                            <div className="p-4 border-t border-red-200 bg-red-50">
                              <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600" />
                                <p className="text-sm text-red-800">
                                  {file.error || 'Failed to process file'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t-2 border-occ-secondary-gray">
                <button 
                  onClick={viewAnalysis}
                  className={`px-4 sm:px-6 py-3 rounded-lg transition-all font-medium shadow-md flex items-center justify-center gap-2 text-sm sm:text-base ${
                    completedCount === 0
                      ? 'bg-occ-gray occ-secondary-white cursor-not-allowed'
                      : 'bg-occ-blue occ-secondary-white hover:bg-occ-blue-dark'
                  }`}
                  disabled={completedCount === 0}
                >
                  <FileCheck size={18} />
                  {showAnalysis ? 'Scroll to Analysis' : 'View Analysis'} ({completedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results Section */}
          {showAnalysis && completedFiles.length > 0 && (
            <div ref={analysisRef} className="space-y-4 sm:space-y-6">
              {/* Analysis Header */}
              <div className="bg-occ-blue-gradient rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <ArrowDown className="w-6 h-6 occ-secondary-white animate-bounce" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold occ-secondary-white">Analysis Results</h2>
                      <p className="occ-secondary-white opacity-90 text-sm sm:text-base">AI-generated summaries for {completedFiles.length} proposals</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyAllSummaries}
                      className="px-3 sm:px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Copy All
                    </button>
                    <button className="px-3 sm:px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2 text-sm">
                      <Share size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Proposal Summaries */}
                  <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                    <div className="bg-occ-blue-dark p-4">
                      <h3 className="text-base sm:text-lg font-semibold occ-secondary-white flex items-center gap-2">
                        <FileCheck size={18} />
                        AI-Generated Proposal Summaries
                      </h3>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {completedFiles.map((file, index) => (
                        <div key={file.id} className="border border-occ-secondary-gray rounded-lg overflow-hidden">
                          {/* File Header */}
                          <div className="bg-occ-secondary-gray p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold bg-occ-blue occ-secondary-white">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="text-sm sm:text-base font-semibold occ-blue-dark">{file.name}</h4>
                                  <p className="text-xs occ-gray">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => copyIndividualSummary(file.id, file.name)}
                                className="px-2 sm:px-3 py-1 bg-occ-blue occ-secondary-white text-xs rounded hover:bg-occ-blue-dark transition-all flex items-center gap-1"
                              >
                                <Copy size={12} />
                                Copy
                              </button>
                            </div>
                          </div>

                          {/* Summary Content */}
                          <div className="p-3 sm:p-4">
                            <h5 className="font-medium occ-blue-dark mb-3 text-sm sm:text-base">Summary:</h5>
                            <p className="occ-blue-dark leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                              {fileSummaries[file.id] || 'No summary available'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="bg-occ-secondary-white rounded-xl shadow-lg border border-occ-secondary-gray p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">Evaluation Actions</h3>
                      {evaluationSaved && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-xs sm:text-sm font-medium">
                            {evaluationSubmitted ? 'Submitted' : 'Saved as Draft'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Save Button */}
                      <button
                        onClick={saveEvaluation}
                        disabled={isSaving || evaluationSubmitted}
                        className={`flex-1 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                          evaluationSubmitted
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSaving
                            ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save as Draft
                          </>
                        )}
                      </button>

                      {/* Cancel Button */}
                      <button
                        onClick={cancelEvaluation}
                        disabled={isSaving || isSubmitting}
                        className="flex-1 px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        <XCircle size={18} />
                        Cancel
                      </button>

                      {/* Submit Button */}
                      <button
                        onClick={submitEvaluation}
                        disabled={isSubmitting || evaluationSubmitted}
                        className={`flex-1 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                          evaluationSubmitted
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : isSubmitting
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : evaluationSubmitted ? (
                          <>
                            <CheckCircle size={18} />
                            Submitted
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Submit Evaluation
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action Descriptions */}
                    <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Action Guide:</h4>
                      <div className="text-xs text-blue-800 space-y-1">
                        <p><strong>Save as Draft:</strong> Save your work to continue later. You can make changes and resubmit.</p>
                        <p><strong>Cancel:</strong> Discard all changes and return to the upload screen.</p>
                        <p><strong>Submit Evaluation:</strong> Finalize and submit your evaluation. This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Analysis Overview */}
                  <div className="bg-occ-secondary-white rounded-xl shadow-lg p-4 sm:p-6 border border-occ-secondary-gray">
                    <h4 className="font-semibold occ-blue-dark mb-4 text-sm sm:text-base">Analysis Overview</h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                        <span className="text-xs sm:text-sm occ-gray">Total Files</span>
                        <span className="font-semibold occ-blue-dark text-sm">{completedFiles.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                        <span className="text-xs sm:text-sm occ-gray">Successfully Processed</span>
                        <span className="font-semibold occ-blue-dark text-sm">{completedFiles.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                        <span className="text-xs sm:text-sm occ-gray">Status</span>
                        <span className={`text-xs sm:text-sm font-medium ${
                          evaluationSubmitted ? 'text-green-600' : 
                          evaluationSaved ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {evaluationSubmitted ? 'Submitted' : 
                           evaluationSaved ? 'Draft Saved' : 'Not Saved'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs sm:text-sm occ-gray">Total Size</span>
                        <span className="font-semibold occ-blue-dark text-sm">
                          {formatFileSize(completedFiles.reduce((total, file) => total + file.size, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Processed Files */}
                  <div className="bg-occ-secondary-white rounded-xl shadow-lg p-4 sm:p-6 border border-occ-secondary-gray">
                    <h4 className="font-semibold occ-blue-dark mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <FileText size={16} className="occ-blue" />
                      Processed Files
                    </h4>
                    <div className="space-y-2">
                      {completedFiles.map((file, index) => (
                        <div key={file.id} className="p-3 bg-occ-secondary-gray rounded border text-xs sm:text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-occ-blue occ-secondary-white text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <p className="font-medium occ-blue-dark truncate flex-1">{file.name}</p>
                          </div>
                          <p className="text-xs occ-gray ml-6 sm:ml-7">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Status */}
                  {(evaluationSaved || evaluationSubmitted) && (
                    <div className={`rounded-xl shadow-lg p-4 sm:p-6 border ${
                      evaluationSubmitted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${
                        evaluationSubmitted ? 'text-green-900' : 'text-blue-900'
                      }`}>
                        {evaluationSubmitted ? (
                          <>
                            <CheckCircle size={16} />
                            Evaluation Submitted
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Draft Saved
                          </>
                        )}
                      </h4>
                      <div className={`text-xs sm:text-sm space-y-2 ${
                        evaluationSubmitted ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        <p>
                          <strong>Files Processed:</strong> {completedFiles.length}
                        </p>
                        <p>
                          <strong>Status:</strong> {evaluationSubmitted ? 'Final Submission' : 'Draft'}
                        </p>
                        {evaluationSubmitted && (
                          <p className="text-xs mt-3 p-2 bg-green-100 rounded border border-green-300">
                            <strong>Note:</strong> This evaluation has been submitted and cannot be modified.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProposalUpload;