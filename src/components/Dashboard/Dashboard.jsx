import React, { useState, useEffect } from 'react';
import MainLayout from '../Mainlayout/MainLayout';
import ContractTile from '../Contract/ContractTile';
import LineChart from '../Charts/LineChart';
import ComplianceOverview from '../Metrics/ComplianceOverview';
import ActivityItem from '../Activity/ActivityItem';
import RecommendationItem from '../Recommendations/RecommendationItem';
import TaskTable from '../Tasks/TaskTable';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Activity, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';

import { contractService, defaultContractData, defaultCycleTimeData } from '../../api/contractService';
import {
  recentActivity,
  aiRecommendations,
  tasks
} from '../../data/dashboardData';
import '../occ-colors.css'; 

const Dashboard = () => {
  // State for contract data from API
  const [contractData, setContractData] = useState(defaultContractData);
  const [cycleTimeData, setCycleTimeData] = useState(defaultCycleTimeData);
  const [loading, setLoading] = useState(true);
  const [cycleTimeLoading, setCycleTimeLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cycleTimeError, setCycleTimeError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch contract summary from API service
  const fetchContractSummary = async () => {
    try {
      setError(null);
      const data = await contractService.fetchContractSummary();
      setContractData(data);
      setLastUpdated(new Date());
      console.log('Contract summary updated:', data);
    } catch (error) {
      console.error('Error fetching contract summary:', error);
      setError(error.message);
      // Keep existing data on error
    }
  };

  // Function to fetch cycle time metrics from API service
  const fetchCycleTimeMetrics = async () => {
    try {
      setCycleTimeError(null);
      const data = await contractService.fetchCycleTimeMetrics();
      setCycleTimeData(data.length > 0 ? data : defaultCycleTimeData);
      console.log('Cycle time metrics updated:', data);
    } catch (error) {
      console.error('Error fetching cycle time metrics:', error);
      setCycleTimeError(error.message);
      // Keep existing data on error
    }
  };

  // Function to fetch all data
  const fetchAllData = async () => {
    await Promise.all([
      fetchContractSummary(),
      fetchCycleTimeMetrics()
    ]);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setCycleTimeLoading(true);
      
      await fetchContractSummary();
      setLoading(false);
      
      await fetchCycleTimeMetrics();
      setCycleTimeLoading(false);
    };

    loadInitialData();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    setCycleTimeLoading(true);
    
    await fetchContractSummary();
    setLoading(false);
    
    await fetchCycleTimeMetrics();
    setCycleTimeLoading(false);
  };

  // Loading state for initial load
  if (loading && !contractData.intake && !contractData.evaluation && !contractData.performance && !contractData.closeout) {
    return (
      <MainLayout title="Dashboard" userRole="Contract Manager">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" userRole="Contract Manager">
      <div className="min-h-screen pb-6 sm:pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 space-y-6 sm:space-y-8">
          
          {/* Error Banner */}
          {(error || cycleTimeError) && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error || cycleTimeError}</span>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm transition-colors"
                disabled={loading || cycleTimeLoading}
              >
                <RefreshCw className={`w-4 h-4 ${(loading || cycleTimeLoading) ? 'animate-spin' : ''}`} />
                Retry
              </button>
            </div>
          )}

          {/* Contracts by Stage Section */}
          <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-occ-blue rounded-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold occ-blue-dark">Contracts by Stage</h2>
                  <p className="text-xs sm:text-sm occ-gray">Overview of contract distribution across lifecycle stages</p>
                </div>
              </div>
              
              {/* Refresh Button and Last Updated */}
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-gray-500 hidden sm:block">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading || cycleTimeLoading}
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${(loading || cycleTimeLoading) ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <ContractTile 
                stage="Intake" 
                count={contractData.intake} 
                color="bg-occ-blue"
                icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                loading={loading}
              />
              <ContractTile 
                stage="Evaluation" 
                count={contractData.evaluation} 
                color="bg-occ-yellow"
                icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                loading={loading}
              />
              <ContractTile 
                stage="Performance" 
                count={contractData.performance} 
                color="bg-occ-secondary-blue"
                icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                loading={loading}
              />
              <ContractTile 
                stage="Closeout" 
                count={contractData.closeout} 
                color="bg-occ-secondary-orange"
                icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                loading={loading}
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Line Chart */}
            <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-occ-secondary-blue rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">Performance Metrics</h3>
                  <p className="text-xs sm:text-sm occ-gray">Cycle time trends and analytics</p>
                </div>
              </div>
              <LineChart 
                data={cycleTimeData} 
                title="Cycle Time by Stage (Days)" 
                loading={cycleTimeLoading}
              />
            </div>

            {/* Compliance Overview */}
            <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-occ-blue rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">Compliance Status</h3>
                  <p className="text-xs sm:text-sm occ-gray">Overall compliance monitoring</p>
                </div>
              </div>
              <ComplianceOverview percentage={83} />
            </div>
          </div>

          {/* Activity and Recommendations Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Activity */}
            <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-occ-secondary-gray bg-occ-secondary-gray">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue rounded-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">Recent Activity</h3>
                    <p className="text-xs sm:text-sm occ-gray">Latest contract updates and changes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="group">
                      <ActivityItem {...activity} />
                      {index < recentActivity.length - 1 && (
                        <div className="mt-3 sm:mt-4 border-b border-occ-secondary-gray"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* View All Button */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-occ-secondary-gray">
                <button className="w-full px-4 py-2 text-sm font-medium occ-blue border border-occ-blue rounded-lg hover:bg-occ-blue hover:occ-secondary-white transition-all">
                  View All Activity
                </button>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-occ-secondary-gray bg-occ-yellow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue-dark rounded-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">AI Recommendations</h3>
                    <p className="text-xs sm:text-sm occ-blue-dark opacity-80">Smart insights and suggested actions</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
                  {aiRecommendations.map((recommendation, index) => (
                    <div key={index} className="group">
                      <RecommendationItem text={recommendation} />
                      {index < aiRecommendations.length - 1 && (
                        <div className="mt-3 sm:mt-4 border-b border-occ-secondary-gray"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* View All Button */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-occ-secondary-gray">
                  <button className="w-full px-4 py-2 text-sm font-medium bg-occ-blue occ-secondary-white rounded-lg hover:bg-occ-blue-dark transition-all">
                    View All Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-occ-secondary-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-occ-blue rounded-lg">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 occ-secondary-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold occ-blue-dark">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                    ) : (
                      contractData.intake + contractData.evaluation + contractData.performance + contractData.closeout
                    )}
                  </div>
                  <div className="text-xs occ-gray">Total Contracts</div>
                </div>
              </div>
            </div>

            <div className="bg-occ-secondary-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-occ-secondary-blue rounded-lg">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 occ-secondary-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold occ-blue-dark">12.5%</div>
                  <div className="text-xs occ-gray">Avg. Growth</div>
                </div>
              </div>
            </div>

            <div className="bg-occ-secondary-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-occ-yellow rounded-lg">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 occ-blue-dark" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold occ-blue-dark">24h</div>
                  <div className="text-xs occ-gray">Avg. Response</div>
                </div>
              </div>
            </div>

            <div className="bg-occ-secondary-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-occ-secondary-orange rounded-lg">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 occ-secondary-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold occ-blue-dark">98.2%</div>
                  <div className="text-xs occ-gray">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-occ-secondary-white rounded-lg sm:rounded-xl shadow-lg border border-occ-secondary-gray sm:border-2 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-occ-secondary-gray bg-occ-secondary-gray">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-occ-blue rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 occ-secondary-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold occ-blue-dark">Active Tasks</h3>
                    <p className="text-xs sm:text-sm occ-gray">Pending actions and upcoming deadlines</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-occ-blue occ-secondary-white text-xs font-medium rounded-full">
                    {tasks.filter(task => task.status === 'pending').length} Pending
                  </span>
                  <span className="px-2 py-1 bg-occ-yellow occ-blue-dark text-xs font-medium rounded-full">
                    {tasks.filter(task => task.priority === 'high').length} High Priority
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-0 sm:p-0">
              <TaskTable tasks={tasks} />
            </div>
          </div>

          {/* Footer Stats */}
          <div className="bg-occ-blue-gradient rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold occ-secondary-white mb-1">
                  {recentActivity.length}
                </div>
                <div className="text-xs sm:text-sm occ-secondary-white opacity-90">
                  Recent Activities
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold occ-secondary-white mb-1">
                  {aiRecommendations.length}
                </div>
                <div className="text-xs sm:text-sm occ-secondary-white opacity-90">
                  AI Recommendations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold occ-secondary-white mb-1">
                  {tasks.length}
                </div>
                <div className="text-xs sm:text-sm occ-secondary-white opacity-90">
                  Active Tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;