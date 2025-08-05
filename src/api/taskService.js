// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Task API Service
export const taskService = {
  // Function to fetch active tasks from API
  fetchActiveTasks: async (params = {}) => {
    try {
      const { status, priority, limit = 20 } = params;
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (priority) queryParams.append('priority', priority);
      queryParams.append('limit', limit);
      
      // Use the correct API endpoint with duplicated path
      const response = await fetch(`${API_BASE_URL}/api/dashboard/api/dashboard/tasks/active?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map API response to match frontend structure
      const mappedTasks = data.tasks.map(task => ({
        id: task.id,
        task: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        contractId: task.contract_id,
        createdAt: task.created_at,
        rawDueDate: task.due_date // Keep raw date for sorting/filtering
      }));
      
      return {
        tasks: mappedTasks,
        summary: data.summary
      };
      
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      throw new Error('Failed to load tasks');
    }
  }
};

// Default/fallback task data - UPDATED TO ZERO DATA
export const defaultTaskData = {
  tasks: [], // Empty array - no mock data
  summary: {
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    high_priority_tasks: 0
  }
};