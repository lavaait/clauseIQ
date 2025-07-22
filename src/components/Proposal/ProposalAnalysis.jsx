import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, Info, BarChart, Calendar, FileText, Download, Share, Loader } from 'lucide-react';
import MainLayout from '../Mainlayout/MainLayout';
import '../occ-colors.css';

const ProposalAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [criteriaWeights] = useState({
    pastPerformance: 30,
    cost: 40,
    compliance: 30
  });

  const { uploadedFiles, selectedSolicitation, solicitationDetails, notes } = location.state || {};

  useEffect(() => {
    if (!uploadedFiles || !selectedSolicitation) {
      navigate('/proposal-upload');
      return;
    }

    // Simulate analysis processing
    const processAnalysis = async () => {
      setLoading(true);
      
      // Simulate API call delay
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
            pastProjects: Math.floor(Math.random() * 20 + 1),
            technicalApproach: 'Advanced cloud-based solution with microservices architecture',
            riskMitigation: 'Comprehensive risk assessment with contingency planning',
            teamExperience: `${Math.floor(Math.random() * 15 + 5)} years average experience`
          },
          scores: {
            pastPerformance: Math.floor(Math.random() * 40 + 60),
            cost: Math.floor(Math.random() * 40 + 60),
            compliance: Math.floor(Math.random() * 40 + 60)
          },
          strengths: [
            'Strong technical expertise',
            'Competitive pricing',
            'Proven track record',
            'Innovative approach'
          ].slice(0, Math.floor(Math.random() * 2 + 2)),
          weaknesses: [
            'Limited local presence',
            'Aggressive timeline',
            'Minor compliance gaps',
            'Resource allocation concerns'
          ].slice(0, Math.floor(Math.random() * 2 + 1))
        })),
        solicitationDetails,
        aiSummary: "Analysis indicates that proposals from Tech Solutions Inc and Innovate Systems provide the best overall value based on the provided criteria. Tech Solutions demonstrates stronger past performance with 15+ years of experience in similar projects, while Innovate Systems offers more competitive pricing with a 12% cost advantage. All proposals meet baseline compliance requirements, though Innovate Systems has some minor deviations in the technical specifications that should be reviewed. The analysis recommends Tech Solutions Inc as the primary choice due to their superior risk mitigation strategies and proven delivery track record.",
        recommendations: [
          "Tech Solutions Inc offers the best overall value proposition",
          "Request clarification from Innovate Systems on technical specifications",
          "Consider negotiating timeline flexibility with preferred vendor",
          "Schedule technical presentations for top 2 proposals"
        ]
      };
      
      setExtractedData(mockExtractedData);
      setLoading(false);
    };

    processAnalysis();
  }, [uploadedFiles, selectedSolicitation, navigate, solicitationDetails]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <MainLayout title='Proposal Analysis' userRole='Proposal Evaluation'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader size={48} className="mx-auto mb-4 occ-blue animate-spin" />
            <h2 className="text-xl font-semibold occ-blue-dark mb-2">Analyzing Proposals</h2>
            <p className="occ-gray">Processing {uploadedFiles?.length || 0} proposals using AI analysis...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!extractedData) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                  <p className="occ-secondary-white opacity-90">AI-powered analysis of {uploadedFiles?.length || 0} proposals</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
                <button className="px-4 py-2 bg-occ-secondary-white/20 hover:bg-occ-secondary-white/30 occ-secondary-white rounded-lg transition-all flex items-center gap-2">
                  <Share size={16} />
                  Share
                </button>
              </div>
            </div>
            
            {/* Solicitation Info */}
            {solicitationDetails && (
              <div className="bg-occ-secondary-white/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold occ-secondary-white mb-1">{solicitationDetails.title}</h3>
                  <p className="text-sm occ-secondary-white opacity-80">{solicitationDetails.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm occ-secondary-white opacity-80 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(solicitationDetails.startDate)} - {formatDate(solicitationDetails.endDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                <div className="bg-occ-blue-dark p-4">
                  <h2 className="text-lg font-semibold occ-secondary-white flex items-center gap-2">
                    <Info size={18} />
                    AI-Generated Analysis Summary
                  </h2>
                </div>
                <div className="p-6">
                  <p className="occ-blue-dark leading-relaxed mb-4">{extractedData.aiSummary}</p>
                  
                  <div className="border-t border-occ-secondary-gray pt-4">
                    <h4 className="font-medium occ-blue-dark mb-3">Key Recommendations:</h4>
                    <ul className="space-y-2">
                      {extractedData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm occ-blue-dark">
                          <span className="w-2 h-2 bg-occ-blue rounded-full mt-1.5 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Detailed Proposal Rankings */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg overflow-hidden border border-occ-secondary-gray">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg font-semibold occ-blue-dark mb-4 flex items-center gap-2">
                    <BarChart size={18} className="occ-blue" />
                    Detailed Proposal Analysis
                  </h2>
                  
                  <div className="space-y-6">
                    {sortedProposals.map((proposal, index) => (
                      <div key={proposal.id} className="border border-occ-secondary-gray rounded-lg overflow-hidden">
                        {/* Proposal Header */}
                        <div className={`p-4 ${index === 0 ? 'bg-occ-blue' : 'bg-occ-secondary-gray'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold border-2 ${
                                index === 0 
                                  ? 'bg-occ-secondary-white occ-blue border-occ-secondary-white' 
                                  : 'bg-occ-secondary-white occ-blue-dark border-occ-secondary-white'
                              }`}>
                                {index + 1}
                              </div>
                              <h3 className={`font-semibold ${index === 0 ? 'occ-secondary-white' : 'occ-blue-dark'}`}>
                                {proposal.company}
                              </h3>
                              {index === 0 && (
                                <span className="bg-occ-yellow occ-blue-dark text-xs px-2 py-1 rounded-full font-medium">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className={`text-xl font-bold ${index === 0 ? 'occ-secondary-white' : 'occ-blue'}`}>
                              {calculateWeightedScore(proposal)}/100
                            </div>
                          </div>
                        </div>

                        {/* Proposal Details */}
                        <div className="p-4 space-y-4">
                          {/* Key Metrics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-occ-secondary-gray rounded border">
                              <p className="text-xs occ-gray mb-1">Proposal Value</p>
                              <p className="font-semibold occ-blue-dark">{proposal.extractedFields.proposalValue}</p>
                            </div>
                            <div className="p-3 bg-occ-secondary-gray rounded border">
                              <p className="text-xs occ-gray mb-1">Timeframe</p>
                              <p className="font-semibold occ-blue-dark">{proposal.extractedFields.timeframe}</p>
                            </div>
                            <div className="p-3 bg-occ-secondary-gray rounded border">
                              <p className="text-xs occ-gray mb-1">Team Size</p>
                              <p className="font-semibold occ-blue-dark">{proposal.extractedFields.keyPersonnel}</p>
                            </div>
                            <div className="p-3 bg-occ-secondary-gray rounded border">
                              <p className="text-xs occ-gray mb-1">Past Projects</p>
                              <p className="font-semibold occ-blue-dark">{proposal.extractedFields.pastProjects}</p>
                            </div>
                          </div>

                          {/* Scoring Breakdown */}
                          <div className="space-y-3">
                            <h4 className="font-medium occ-blue-dark">Evaluation Scores:</h4>
                            <div className="space-y-2">
                              {Object.entries(proposal.scores).map(([criterion, score]) => (
                                <div key={criterion}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="occ-gray capitalize">
                                      {criterion.replace(/([A-Z])/g, ' $1').trim()} ({criteriaWeights[criterion]}%)
                                    </span>
                                    <span className="font-medium occ-blue-dark">{score}/100</span>
                                  </div>
                                  <div className="w-full bg-occ-secondary-gray rounded-full h-2">
                                    <div 
                                      className="bg-occ-blue h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Strengths and Weaknesses */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium occ-blue-dark mb-2 text-sm">Strengths:</h4>
                              <ul className="space-y-1">
                                {proposal.strengths.map((strength, idx) => (
                                  <li key={idx} className="text-sm occ-blue-dark flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium occ-blue-dark mb-2 text-sm">Areas of Concern:</h4>
                              <ul className="space-y-1">
                                {proposal.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="text-sm occ-blue-dark flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-occ-secondary-orange rounded-full mt-1.5 flex-shrink-0"></span>
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats Sidebar */}
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border border-occ-secondary-gray">
                <h3 className="font-semibold occ-blue-dark mb-4">Analysis Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                    <span className="text-sm occ-gray">Total Proposals</span>
                    <span className="font-semibold occ-blue-dark">{uploadedFiles?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                    <span className="text-sm occ-gray">Fully Compliant</span>
                    <span className="font-semibold occ-blue-dark">
                      {sortedProposals.filter(p => p.extractedFields.compliance === 'Fully Compliant').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-occ-secondary-gray">
                    <span className="text-sm occ-gray">Average Score</span>
                    <span className="font-semibold occ-blue-dark">
                      {sortedProposals.length > 0 
                        ? (sortedProposals.reduce((sum, p) => sum + parseFloat(calculateWeightedScore(p)), 0) / sortedProposals.length).toFixed(1)
                        : '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm occ-gray">Top Score</span>
                    <span className="font-semibold occ-blue-dark">
                      {sortedProposals.length > 0 ? calculateWeightedScore(sortedProposals[0]) : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border border-occ-secondary-gray">
                <h3 className="font-semibold occ-blue-dark mb-4 flex items-center gap-2">
                  <FileText size={16} className="occ-blue" />
                  Analyzed Files
                </h3>
                <div className="space-y-2">
                  {uploadedFiles?.map(file => (
                    <div key={file.id} className="p-2 bg-occ-secondary-gray rounded border text-sm">
                      <p className="font-medium occ-blue-dark truncate">{file.name}</p>
                      <p className="text-xs occ-gray">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="bg-occ-secondary-white rounded-xl shadow-lg p-6 border border-occ-secondary-gray">
                  <h3 className="font-semibold occ-blue-dark mb-4">Analysis Notes</h3>
                  <p className="text-sm occ-gray leading-relaxed">{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProposalAnalysis;