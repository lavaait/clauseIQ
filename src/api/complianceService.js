// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Compliance API Service
export const complianceService = {
  // Function to fetch compliance data from API
  fetchComplianceData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/api/contract/compliance`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      throw new Error('Failed to load compliance data');
    }
  },

  // Function to fetch compliance data by contract ID (if needed)
  fetchComplianceByContract: async (contractId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/api/contract/compliance?contract_id=${contractId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching compliance data by contract:', error);
      throw new Error('Failed to load compliance data for contract');
    }
  },

  // Function to fetch compliance data by clause ID (if needed)
  fetchComplianceByClause: async (contractId, clauseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/api/contract/compliance?contract_id=${contractId}&clause_id=${clauseId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching compliance data by clause:', error);
      throw new Error('Failed to load compliance data for clause');
    }
  }
};

// Default/fallback data
export const defaultComplianceData = [];

// Sample compliance data structure for reference
export const sampleComplianceData = [
  {
    "contract_id": "Contract_2",
    "clause_id": "0",
    "title": "Uncategorized",
    "compliance_summary": "Market Research for the United States Department of Defense",
    "compliance_confidence": 0,
    "closeout_status": "Review Required",
    "risk_assessment": "High"
  },
  {
    "contract_id": "Contract_2",
    "clause_id": "2",
    "title": "Termination",
    "compliance_summary": "Compliant",
    "compliance_confidence": 0,
    "closeout_status": "Review Required",
    "risk_assessment": "High"
  }
];

// Utility functions for compliance calculations
export const complianceUtils = {
  // Calculate overall compliance percentage
  calculateCompliancePercentage: (complianceData) => {
    if (!complianceData || complianceData.length === 0) return 0;
    
    const totalItems = complianceData.length;
    const compliantItems = complianceData.filter(
      item => item.compliance_summary && item.compliance_summary.toLowerCase() === 'compliant'
    ).length;
    
    return totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
  },

  // Count critical issues
  countCriticalIssues: (complianceData) => {
    if (!complianceData || complianceData.length === 0) return 0;
    
    return complianceData.filter(
      item => item.risk_assessment === 'High' || item.closeout_status === 'Review Required'
    ).length;
  },

  // Get unique contracts
  getUniqueContracts: (complianceData) => {
    if (!complianceData || complianceData.length === 0) return [];
    
    const contracts = [...new Set(complianceData.map(item => item.contract_id))];
    return contracts;
  },

  // Get clauses by contract
  getClausesByContract: (complianceData, contractId) => {
    if (!complianceData || complianceData.length === 0) return [];
    
    return complianceData.filter(item => item.contract_id === contractId);
  },

  // Get compliance summary by risk level
  getComplianceSummaryByRisk: (complianceData) => {
    if (!complianceData || complianceData.length === 0) {
      return { high: 0, medium: 0, low: 0 };
    }

    const summary = { high: 0, medium: 0, low: 0 };
    
    complianceData.forEach(item => {
      const risk = item.risk_assessment?.toLowerCase();
      if (risk === 'high') summary.high++;
      else if (risk === 'medium') summary.medium++;
      else summary.low++;
    });

    return summary;
  },

  // Get compliance summary by status
  getComplianceSummaryByStatus: (complianceData) => {
    if (!complianceData || complianceData.length === 0) {
      return { compliant: 0, reviewRequired: 0, nonCompliant: 0 };
    }

    const summary = { compliant: 0, reviewRequired: 0, nonCompliant: 0 };
    
    complianceData.forEach(item => {
      const isCompliant = item.compliance_summary && 
                         item.compliance_summary.toLowerCase() === 'compliant';
      const needsReview = item.closeout_status === 'Review Required';
      
      if (isCompliant) summary.compliant++;
      else if (needsReview) summary.reviewRequired++;
      else summary.nonCompliant++;
    });

    return summary;
  }
};