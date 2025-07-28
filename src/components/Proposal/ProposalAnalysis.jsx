import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, FileText, Download, Share } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ProposalAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);

  const { uploadedFiles, fileSummaries } = location.state || {};

  useEffect(() => {
    if (!uploadedFiles || !fileSummaries) {
      navigate('/proposal-upload');
      return;
    }

    // Process the data from API
    const processedData = {
      files: uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        summary: fileSummaries[file.id] || 'No summary available'
      }))
    };

    setAnalysisData(processedData);
  }, [uploadedFiles, fileSummaries, navigate]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyAllSummaries = () => {
    const allSummaries = analysisData.files
      .map((file, index) => `${index + 1}. ${file.name}\n${file.summary}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(allSummaries);
    alert('All summaries copied to clipboard!');
  };

  if (!analysisData) {
    return (
      <MainLayout title='Proposal Analysis' userRole='Proposal Evaluation'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold occ-blue-dark mb-2">No Analysis Data</h2>
            <p className="occ-gray mb-4">Unable to load analysis data.</p>
            <button 
              onClick={() => navigate('/proposal-upload')}
              className="px-6 py-3 bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all"
            >
              Return to Upload
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='Proposal Analysis' userRole='Proposal Evaluation'>
      <div className="min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="bg-occ-blue-gradient rounded-xl p-6 sm:p-8 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/proposal-upload')}
                  className="p-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-6 h-6 occ-secondary-white" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold occ-secondary-white">Proposal Analysis Results</h1>
                  <p className="occ-secondary-white opacity-90">AI-generated summaries for {analysisData.files.length} proposals</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={copyAllSummaries}
                  className="px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Copy All
                </button>
                <button className="px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2">
                  <Share size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Proposal Summaries */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                <div className="bg-occ-blue-dark p-4">
                  <h2 className="text-lg font-semibold occ-secondary-white flex items-center gap-2">
                    <FileCheck size={18} />
                    AI-Generated Proposal Summaries
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {analysisData.files.map((file, index) => (
                    <div key={file.id} className="border border-occ-secondary-gray rounded-lg overflow-hidden">
                      {/* File Header */}
                      <div className="bg-occ-secondary-gray p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full w-8 h-8 flex items-center justify-center font-semibold bg-occ-blue occ-secondary-white">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold occ-blue-dark">{file.name}</h3>
                              <p className="text-xs occ-gray">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.summary);
                              alert('Summary copied to clipboard!');
                            }}
                            className="px-3 py-1 bg-occ-blue occ-secondary-white text-xs rounded hover:bg-occ-blue-dark transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Summary Content */}
                      <div className="p-4">
                        <h4 className="font-medium occ-blue-dark mb-3">Summary:</h4>
                        <p className="occ-blue-dark leading-relaxed whitespace-pre-wrap text-sm">
                          {file.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border border-occ-secondary-gray">
                <h3 className="font-semibold occ-blue-dark mb-4">Analysis Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                    <span className="text-sm occ-gray">Total Files</span>
                    <span className="font-semibold occ-blue-dark">{analysisData.files.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                    <span className="text-sm occ-gray">Successfully Processed</span>
                    <span className="font-semibold occ-blue-dark">{analysisData.files.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm occ-gray">Total Size</span>
                    <span className="font-semibold occ-blue-dark">
                      {formatFileSize(analysisData.files.reduce((total, file) => total + file.size, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processed Files */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border border-occ-secondary-gray">
                <h3 className="font-semibold occ-blue-dark mb-4 flex items-center gap-2">
                  <FileText size={16} className="occ-blue" />
                  Processed Files
                </h3>
                <div className="space-y-2">
                  {analysisData.files.map((file, index) => (
                    <div key={file.id} className="p-3 bg-occ-secondary-gray rounded border text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-occ-blue occ-secondary-white text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <p className="font-medium occ-blue-dark truncate flex-1">{file.name}</p>
                      </div>
                      <p className="text-xs occ-gray ml-7">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProposalAnalysis;