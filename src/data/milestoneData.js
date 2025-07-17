export const milestonesMockData = [
  {
    id: 1,
    title: 'RFI Release',
    type: 'RFI',
    startDate: '2024-04-15',
    endDate: '2024-04-22',
    status: 'completed',
    description: 'Request for Information release',
    assignees: ['John Doe', 'Jane Smith']
  },
  {
    id: 2,
    title: 'RFP Development',
    type: 'RFP',
    startDate: '2024-04-25',
    endDate: '2024-05-15',
    status: 'in-progress',
    description: 'Request for Proposal development and review',
    assignees: ['Mike Johnson', 'Sarah Wilson'],
    hasWarning: true
  },
  {
    id: 3,
    title: 'RFP Release',
    type: 'RFP',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    status: 'pending',
    description: 'Request for Proposal release to vendors',
    assignees: ['Mike Johnson']
  },
  {
    id: 4,
    title: 'Proposal Evaluation',
    type: 'Evaluation',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    status: 'pending',
    description: 'Technical and commercial evaluation of proposals',
    assignees: ['Evaluation Team']
  },
  {
    id: 5,
    title: 'Legal Review',
    type: 'Legal',
    startDate: '2024-06-16',
    endDate: '2024-06-25',
    status: 'pending',
    description: 'Legal review and approval process',
    assignees: ['Legal Team']
  },
  {
    id: 6,
    title: 'Final Award',
    type: 'Award',
    startDate: '2024-06-26',
    endDate: '2024-06-30',
    status: 'pending',
    description: 'Contract award and notification',
    assignees: ['Contract Manager']
  }
];

export const milestoneTypes = ['RFI', 'RFP', 'Evaluation', 'Legal', 'Award', 'Other'];

export const defaultFormData = {
  title: '',
  type: 'RFI',
  startDate: '',
  endDate: '',
  description: '',
  assignees: []
};

// Project date constants
export const projectTimelineConfig = {
  startDate: '2024-04-15',
  endDate: '2024-06-30',
  todayPosition: '28%' // This would be calculated in a real app
};

// For a real API implementation, you might want functions like these
export const milestonesApi = {
  getMilestones: async () => {
    // In the real implementation, this would be an actual API call
    // For now, just simulate a delay and return the mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(milestonesMockData);
      }, 300);
    });
  },
  
  addMilestone: async (milestone) => {
    // In real implementation, this would POST to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...milestone, id: Date.now() });
      }, 300);
    });
  },
  
  updateMilestone: async (milestone) => {
    // In real implementation, this would PUT to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(milestone);
      }, 300);
    });
  },
  
  deleteMilestone: async (id) => {
    // In real implementation, this would DELETE to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id });
      }, 300);
    });
  }
};