import React from 'react';
import MainLayout from '../Mainlayout/MainLayout';
import ContractTile from '../Contract/ContractTile';
import LineChart from '../Charts/LineChart';
import ComplianceOverview from '../Metrics/ComplianceOverview';
import ActivityItem from '../Activity/ActivityItem';
import RecommendationItem from '../Recommendations/RecommendationItem';
import TaskTable from '../Tasks/TaskTable';

import {
  contractData,
  cycleTimeData,
  recentActivity,
  aiRecommendations,
  tasks
} from '../../data/dashboardData';
import '../occ-colors.css'; 

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard" userRole="Contract Manager">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contracts by Stage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ContractTile stage="Intake" count={contractData.intake} color="bg-occ-blue" />
          <ContractTile stage="Evaluation" count={contractData.evaluation} color="bg-occ-yellow" />
          <ContractTile stage="Performance" count={contractData.performance} color="bg-occ-secondary-blue" />
          <ContractTile stage="Closeout" count={contractData.closeout} color="bg-occ-secondary-orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart data={cycleTimeData} title="Cycle Time (Days)" />
        <ComplianceOverview percentage={83} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {aiRecommendations.map((recommendation, index) => (
              <RecommendationItem key={index} text={recommendation} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <TaskTable tasks={tasks} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;