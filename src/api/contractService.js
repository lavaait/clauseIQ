// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Contract API Service
export const contractService = {
  // Function to fetch contract summary from API
  fetchContractSummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/new_contract_request/contracts/summary`, {
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
      return {
        intake: data.intake || 0,
        evaluation: data.evaluation || 0,
        performance: data.performance || 0,
        closeout: data.executed || 0, // Map 'executed' to 'closeout'
      };
      
    } catch (error) {
      console.error('Error fetching contract summary:', error);
      throw new Error('Failed to load contract data');
    }
  },

  // Function to fetch cycle time metrics from API
  fetchCycleTimeMetrics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/new_contract_request/api/dashboard/metrics/cycle-time`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Return the cycle time data directly
      return data.cycle_time_data || [];
      
    } catch (error) {
      console.error('Error fetching cycle time metrics:', error);
      throw new Error('Failed to load cycle time data');
    }
  }
};

// Default contract data (fallback/static data)
export const defaultContractData = {
  intake: 0,
  evaluation: 0,
  performance: 0,
  closeout: 0
};

// Default cycle time data (fallback/static data)
export const defaultCycleTimeData = [];