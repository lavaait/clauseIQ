import React, { useState, useRef} from 'react';
import { Upload, FileText, X, ChevronDown, Info, FileCheck, Loader, ArrowRight, Check, AlertCircle, BarChart, Calendar } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';
import { milestonesMockData } from '../../data/milestoneData';

const ProposalUpload = () => {
  const [selectedSolicitation, setSelectedSolicitation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [extractedData, setExtractedData] = useState(null);
  const [criteriaWeights] = useState({
    pastPerformance: 30,
    cost: 40,
    compliance: 30
  });
  const fileInputRef = useRef(null);

  // Extract solicitations from the milestone data
  const solicitationsFromMilestones = milestonesMockData
    .filter(milestone => milestone.type === 'RFP')
    .map(milestone => {
      const rfpId = `RFP-2024-00${milestone.id}`;
      return {
        id: milestone.id,
        title: `${rfpId} - ${milestone.title}`,
        description: milestone.description,
        startDate: milestone.startDate,
        endDate: milestone.endDate,
        status: milestone.status
      };
    });

  const additionalSolicitations = [
    {
      id: 100,
      title: 'RFP-2024-001 - IT Services Contract',
      description: 'Request for proposals for IT services and infrastructure management',
      startDate: '2024-03-10',
      endDate: '2024-04-10',
      status: 'completed'
    },
    {
      id: 101,
      title: 'RFP-2024-004 - Equipment Procurement',
      description: 'Procurement of office equipment and supplies for the fiscal year 2024',
      startDate: '2024-05-01',
      endDate: '2024-05-30',
      status: 'pending'
    }
  ];

  const allSolicitationObjects = [...solicitationsFromMilestones, ...additionalSolicitations];
  
  const solicitations = [
    'Enter the solicitation',
    ...allSolicitationObjects.map(sol => sol.title)
  ];

  const getSelectedSolicitationDetails = () => {
    if (!selectedSolicitation || selectedSolicitation === 'Enter the solicitation') {
      return null;
    }
    
    const solicitationTitle = selectedSolicitation;
    return allSolicitationObjects.find(sol => sol.title === solicitationTitle);
  };

  const processFilesWithNLP = async () => {
  
    if (!selectedSolicitation || selectedSolicitation === 'Enter the solicitation') {
      alert('Please select a solicitation');
      return;
    }

    // Check if files are uploaded
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one proposal');
      return;
    }

    try {
      setProcessingStatus('processing');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockExtractedData = {
        proposals: uploadedFiles.map(file => ({
          id: file.id,
          name: file.name,
          company: file.name.split('.')[0].replace(/_/g, ' '),
          extractedFields: {
            proposalValue: `$${Math.floor(Math.random() * 900000 + 100000).toLocaleString()}`,
            timeframe: `${Math.floor(Math.random() * 12 + 1)} months`,
            keyPersonnel: Math.floor(Math.random() * 10 + 5),
            compliance: Math.random() > 0.3 ? 'Fully Compliant' : 'Partially Compliant',
            pastProjects: Math.floor(Math.random() * 20 + 1)
          },
          scores: {
            pastPerformance: Math.floor(Math.random() * 40 + 60),
            cost: Math.floor(Math.random() * 40 + 60),
            compliance: Math.floor(Math.random() * 40 + 60)
          }
        })),
        solicitationDetails: getSelectedSolicitationDetails(),
        aiSummary: "Analysis indicates that proposals from Tech Solutions Inc and Innovate Systems provide the best overall value based on the provided criteria. Tech Solutions demonstrates stronger past performance, while Innovate Systems offers more competitive pricing. All proposals meet baseline compliance requirements, though Innovate Systems has some minor deviations that should be reviewed."
      };
      
      setExtractedData(mockExtractedData);
      setProcessingStatus('completed');
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingStatus('error');
    }
  };

  const handleFileUpload = (files) => {
    if (processingStatus === 'completed') {
      setProcessingStatus('idle');
      setExtractedData(null);
    }
    
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
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
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    if (uploadedFiles.length === 1) {
      setProcessingStatus('idle');
      setExtractedData(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateWeightedScore = (proposal) => {
    if (!proposal || !proposal.scores) return 0;
    
    const { pastPerformance, cost, compliance } = proposal.scores;
    const weights = criteriaWeights;
    
    return (
      (pastPerformance * weights.pastPerformance / 100) +
      (cost * weights.cost / 100) +
      (compliance * weights.compliance / 100)
    ).toFixed(1);
  };

  const sortedProposals = extractedData?.proposals
    ? [...extractedData.proposals].sort((a, b) => {
        return calculateWeightedScore(b) - calculateWeightedScore(a);
      })
    : [];

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-occ-secondary-blue occ-secondary-white';
      case 'in-progress':
        return 'bg-occ-blue occ-secondary-white';
      default:
        return 'bg-occ-gray occ-secondary-white';
    }
  };

  return (
    <MainLayout title='Proposal Upload' userRole='Proposal Evaluation'>
      <div className="min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-6 sm:p-8 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileCheck className="w-8 h-8 occ-secondary-white" />
              <h1 className="text-2xl sm:text-3xl font-bold occ-secondary-white">Proposal Upload & Analysis</h1>
            </div>
            <p className="occ-secondary-white opacity-90">Upload proposals and generate AI-based summaries for evaluation</p>
          </div>

          {/* Main Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className={`bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray ${processingStatus === 'completed' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
              <div className="p-6 sm:p-8">
                {/* Solicitation Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium occ-blue-dark mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 occ-blue" />
                    Solicitation <span className="occ-secondary-orange">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 text-left bg-occ-secondary-white border-2 border-occ-secondary-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-occ-blue focus:border-occ-blue transition-all duration-200 flex items-center justify-between shadow-sm hover:border-occ-blue"
                    >
                      <span className={`truncate ${selectedSolicitation === '' ? 'occ-gray' : 'occ-blue-dark'}`}>
                        {selectedSolicitation || 'Select a solicitation'}
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={`flex-shrink-0 ml-1 occ-gray transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-occ-secondary-white border-2 border-occ-secondary-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {solicitations.map((solicitation, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedSolicitation(solicitation === 'Enter the solicitation' ? '' : solicitation);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-occ-secondary-gray transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span className={`block truncate ${solicitation === 'Enter the solicitation' ? 'occ-gray' : 'occ-blue-dark'}`}>
                              {solicitation}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Show selected solicitation details */}
                  {getSelectedSolicitationDetails() && (
                    <div className="mt-3 p-4 bg-occ-secondary-gray rounded-lg border-2 border-occ-blue">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h4 className="text-sm font-medium occ-blue-dark">Solicitation Details</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(getSelectedSolicitationDetails().status)}`}>
                          {getSelectedSolicitationDetails().status === 'completed' ? 'Completed' : 
                           getSelectedSolicitationDetails().status === 'in-progress' ? 'In Progress' : 
                           'Pending'}
                        </span>
                      </div>
                      <p className="text-xs occ-gray mb-2">{getSelectedSolicitationDetails().description}</p>
                      <p className="text-xs occ-blue flex items-center gap-1 flex-wrap">
                        <Calendar size={12} />
                        <span>{formatDate(getSelectedSolicitationDetails().startDate)} - {formatDate(getSelectedSolicitationDetails().endDate)}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium occ-blue-dark mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 occ-blue" />
                    Upload Proposals <span className="occ-secondary-orange">*</span>
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 ${
                      isDragOver
                        ? 'border-occ-blue bg-occ-secondary-gray'
                        : 'border-occ-gray hover:border-occ-blue hover:bg-occ-secondary-gray'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload size={40} className="mx-auto mb-3 occ-gray" />
                    <p className="text-sm sm:text-base font-medium occ-blue-dark mb-2">
                      Drag and drop proposals here or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="occ-blue hover:occ-blue-dark underline font-medium transition-colors"
                      >
                        Browse
                      </button>
                    </p>
                    <p className="text-xs sm:text-sm occ-gray">
                      Supported formats: PDF, Word documents (up to 50MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Uploaded Files List */}
                                    {uploadedFiles.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-medium occ-blue-dark mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 occ-blue" />
                        Uploaded Proposals ({uploadedFiles.length})
                      </h3>
                      <div className="space-y-2">
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-occ-secondary-gray rounded-lg border-2 border-occ-secondary-gray hover:border-occ-blue transition-all"
                          >
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
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1.5 bg-occ-secondary-white occ-gray hover:occ-secondary-orange rounded-full border-2 border-occ-secondary-gray hover:border-occ-secondary-orange transition-all flex-shrink-0 ml-2"
                              disabled={processingStatus === 'processing'}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium occ-blue-dark mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 occ-blue" />
                    Notes <span className="text-xs occ-gray">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any relevant notes or comments about the proposals"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-occ-secondary-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-occ-blue focus:border-occ-blue transition-all resize-none shadow-sm bg-occ-secondary-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t-2 border-occ-secondary-gray">
                  {processingStatus === 'processing' ? (
                    <button className="px-4 sm:px-6 py-3 bg-occ-gray occ-secondary-white rounded-lg flex items-center justify-center gap-2 cursor-not-allowed" disabled>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </button>
                  ) : processingStatus === 'completed' ? (
                    <button 
                      onClick={() => setProcessingStatus('idle')} 
                      className="px-4 sm:px-6 py-3 bg-occ-blue occ-secondary-white rounded-lg flex items-center justify-center gap-2 hover:bg-occ-blue-dark transition-all shadow-md"
                    >
                      <Check size={18} />
                      Analysis Complete
                    </button>
                  ) : (
                    <button 
                      onClick={processFilesWithNLP} 
                      className={`px-4 sm:px-6 py-3 rounded-lg transition-all font-medium shadow-md flex items-center justify-center gap-2 ${
                        uploadedFiles.length === 0 || !selectedSolicitation || selectedSolicitation === 'Enter the solicitation'
                          ? 'bg-occ-gray occ-secondary-white cursor-not-allowed'
                          : 'bg-occ-blue occ-secondary-white hover:bg-occ-blue-dark'
                      }`}
                      disabled={uploadedFiles.length === 0 || !selectedSolicitation || selectedSolicitation === 'Enter the solicitation'}
                    >
                      <ArrowRight size={18} />
                      Analyze Proposals
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {processingStatus === 'completed' && extractedData && (
              <div className="lg:col-span-2 space-y-6">
                {/* AI Summary */}
                <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                  <div className="bg-occ-blue-dark p-4">
                    <h2 className="text-lg font-semibold occ-secondary-white flex items-center gap-2">
                      <Info size={18} />
                      AI-Generated Analysis Summary
                    </h2>
                  </div>
                  <div className="p-6">
                    {selectedSolicitation && (
                      <div className="flex items-center gap-2 text-sm occ-gray mb-3 flex-wrap">
                        <FileCheck size={16} className="occ-blue flex-shrink-0" />
                        <span className="break-all">Analyzing proposals for: <strong className="occ-blue-dark">{getSelectedSolicitationDetails()?.title}</strong></span>
                      </div>
                    )}
                    <p className="occ-blue-dark leading-relaxed">{extractedData.aiSummary}</p>
                  </div>
                </div>
                
                {/* Ranked Proposals */}
                <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold occ-blue-dark mb-4 flex items-center gap-2">
                      <BarChart size={18} className="occ-blue" />
                      Proposal Rankings
                    </h2>
                    
                    <div className="space-y-4">
                      {sortedProposals.map((proposal, index) => (
                        <div 
                          key={proposal.id} 
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                            index === 0 
                              ? 'border-occ-blue bg-occ-secondary-gray shadow-md' 
                              : 'border-occ-secondary-gray bg-occ-secondary-white hover:border-occ-blue'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center occ-secondary-white font-semibold border-2 ${
                                index === 0 
                                  ? 'bg-occ-blue border-occ-blue' 
                                  : 'bg-occ-gray border-occ-gray'
                              }`}>
                                {index + 1}
                              </div>
                              <h3 className="font-semibold occ-blue-dark truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">{proposal.company}</h3>
                              {index === 0 && (
                                <span className="bg-occ-yellow occ-blue-dark text-xs px-2 py-1 rounded-full font-medium">
                                  Top Ranked
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-bold occ-blue flex items-center gap-1">
                              {calculateWeightedScore(proposal)}
                              <span className="text-xs occ-gray font-normal">/100</span>
                            </div>
                          </div>
                          
                          {/* Details Grid */}
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4">
                            <div className="p-2 bg-occ-secondary-white rounded border-2 border-occ-secondary-gray">
                              <p className="text-xs occ-gray mb-1">Proposal Value</p>
                              <p className="font-medium occ-blue-dark">{proposal.extractedFields.proposalValue}</p>
                            </div>
                            <div className="p-2 bg-occ-secondary-white rounded border-2 border-occ-secondary-gray">
                              <p className="text-xs occ-gray mb-1">Timeframe</p>
                              <p className="font-medium occ-blue-dark">{proposal.extractedFields.timeframe}</p>
                            </div>
                            <div className="p-2 bg-occ-secondary-white rounded border-2 border-occ-secondary-gray">
                              <p className="text-xs occ-gray mb-1">Key Personnel</p>
                              <p className="font-medium occ-blue-dark">{proposal.extractedFields.keyPersonnel}</p>
                            </div>
                            <div className="p-2 bg-occ-secondary-white rounded border-2 border-occ-secondary-gray">
                              <p className="text-xs occ-gray mb-1">Compliance</p>
                              <p className={`font-medium ${proposal.extractedFields.compliance === 'Fully Compliant' ? 'occ-blue' : 'occ-secondary-orange'}`}>
                                {proposal.extractedFields.compliance}
                              </p>
                            </div>
                            <div className="p-2 bg-occ-secondary-white rounded border-2 border-occ-secondary-gray">
                              <p className="text-xs occ-gray mb-1">Past Projects</p>
                              <p className="font-medium occ-blue-dark">{proposal.extractedFields.pastProjects}</p>
                            </div>
                          </div>
                          
                          {/* Simple Score Bars - Only showing scores with percentages */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1 flex-wrap gap-1">
                                <span className="occ-gray">Past Performance ({criteriaWeights.pastPerformance}%)</span>
                                <span className="font-medium occ-blue-dark">{proposal.scores.pastPerformance}/100</span>
                              </div>
                              <div className="w-full bg-occ-secondary-gray rounded-full h-2 border border-occ-secondary-gray">
                                <div 
                                  className="bg-occ-blue h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${proposal.scores.pastPerformance}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs mb-1 flex-wrap gap-1">
                                <span className="occ-gray">Cost ({criteriaWeights.cost}%)</span>
                                <span className="font-medium occ-blue-dark">{proposal.scores.cost}/100</span>
                              </div>
                              <div className="w-full bg-occ-secondary-gray rounded-full h-2 border border-occ-secondary-gray">
                                <div 
                                  className="bg-occ-secondary-blue h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${proposal.scores.cost}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs mb-1 flex-wrap gap-1">
                                <span className="occ-gray">Compliance ({criteriaWeights.compliance}%)</span>
                                <span className="font-medium occ-blue-dark">{proposal.scores.compliance}/100</span>
                              </div>
                              <div className="w-full bg-occ-secondary-gray rounded-full h-2 border border-occ-secondary-gray">
                                <div 
                                  className="bg-occ-blue-dark h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${proposal.scores.compliance}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* View Buttons */}
                          <div className="flex justify-end mt-4 pt-3 border-t border-occ-secondary-gray">
                            <button className="text-xs occ-blue flex items-center gap-1 hover:occ-blue-dark transition-all font-medium px-3 py-1 rounded-md hover:bg-occ-secondary-gray">
                              View detailed report
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message if processing failed */}
          {processingStatus === 'error' && (
            <div className="mt-6 bg-occ-secondary-white border-2 border-occ-secondary-orange rounded-lg p-4 flex items-start gap-3 shadow-md">
              <AlertCircle size={20} className="occ-secondary-orange shrink-0 mt-0.5" />
              <div>
                <h3 className="occ-secondary-orange font-medium mb-1">Processing Error</h3>
                <p className="occ-blue-dark text-sm">
                  There was an error processing your proposals. Please try again or contact support if the issue persists.
                </p>
                <button 
                  onClick={() => setProcessingStatus('idle')}
                  className="mt-2 text-xs occ-blue hover:occ-blue-dark underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProposalUpload;