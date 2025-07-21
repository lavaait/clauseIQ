import '../occ-colors.css';
import React, { useState } from 'react';
import { Upload, X, FileText, DollarSign, FileCheck, Calendar, Building, FileSpreadsheet } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';

const NewContractRequestForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    agency: '',
    contractType: '',
    value: '',
    attachments: []
  });

  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== fileId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock API call - simulates data persistence
    const mockApiCall = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate saving to localStorage for persistence
          const savedRequests = JSON.parse(localStorage.getItem('contractRequests') || '[]');
          const newRequest = {
            id: Date.now(),
            ...formData,
            submittedAt: new Date().toISOString()
          };
          savedRequests.push(newRequest);
          localStorage.setItem('contractRequests', JSON.stringify(savedRequests));
          resolve(newRequest);
        }, 1000);
      });
    };

    mockApiCall()
      .then((savedRequest) => {
        console.log('Contract request saved:', savedRequest);
        alert('Contract request submitted successfully!');
        
        // Reset form
        setFormData({
          title: '',
          agency: '',
          contractType: '',
          value: '',
          attachments: []
        });
      })
      .catch((error) => {
        console.error('Error saving contract request:', error);
        alert('Error submitting request. Please try again.');
      });
  };

  return (
    <MainLayout title="New Contract Request" userRole="Contract Intake">
      <div className="min-h-screen  ">
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
          
          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-lg p-8">
            <div className="space-y-8">
              {/* Two inputs in one row */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Second row with two inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm appearance-none bg-white"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 border-occ-blue transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 occ-blue" />
                  Document Upload
                </h3>

                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    dragActive 
                      ? 'border-occ-blue bg-occ-secondary-gray' 
                      : 'border-gray-300 hover:border-occ-blue hover:bg-gray-50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2 font-medium">
                    Drag and drop files here, or{' '}
                    <label className="occ-blue hover:text-occ-blue-dark cursor-pointer underline">
                      browse
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for PDF, DOC, DOCX, XLS, XLSX files up to 10MB each
                  </p>
                </div>

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 occ-blue" />
                      Uploaded Files ({formData.attachments.length})
                    </h4>
                    
                    <div className="grid gap-3">
                      {formData.attachments.map((file) => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-occ-secondary-gray rounded-md">
                              <FileText className="w-5 h-5 occ-blue" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 bg-white text-gray-500 hover:occ-secondary-orange rounded-full border border-gray-200 hover:border-occ-secondary-orange transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-8 border-t border-gray-100">
                <button
                  type="submit"
                  className="px-8 py-3 bg-occ-blue occ-secondary-white font-medium rounded-lg hover:bg-occ-blue-dark focus:ring-4 focus:ring-occ-blue focus:ring-opacity-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
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