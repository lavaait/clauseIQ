// config/routes.config.js
import Dashboard from '../components/Dashboard/Dashboard';
import NewContractRequestForm from '../components/Contract-Intake/NewContractRequestForm';
import SolicitationPlanning from '../components/Solicitation-Planner/SolicitationPlanning';
import ProposalUpload from '../components/Proposal/ProposalUpload';
import ClauseValidationInterface from '../components/Clause-Compliance/ClauseValidationInterface';
import ChecklistGenerator from '../components/Clause-Compliance/ChecklistGenerator';
import ContractModificationTracker from '../components/Modifications/ContractModificationTracker';
import CloseoutChecklistWizard from '../components/Closeout/CloseoutChecklistWizard';
import UserManagement from '../components/Admin/UserManagement';
import AIAuditLogs from '../components/Admin/AIAuditLogs';
import ComplianceDashboard from '../components/Reports-Exports/ComplianceDashboard';
import ContractRequestList from '../components/Contract-Intake/ContractRequestList';
import ContractIntakeDetail from '../components/Contract-Intake/ContractIntakeDetail';
import ContractDraftGenerator from '../components/Contract-Intake/ContractDraftGenerator';
import ContractAnalyzer from '../components/Proposal/ContractAnalyzer';
import RenewalIntelligence from '../components/Proposal/RenewalIntelligence';
import RedliningCoach from '../components/Proposal/RedliningCoach';

export const routesConfig = [
  // Main Dashboard
  {
    path: '/',
    component: Dashboard,
    title: 'Dashboard',
    section: 'main',
    breadcrumbs: ['Dashboard']
  },

  // Contract Lifecycle - Contract Intake
  {
    path: '/new-contract-request',
    component: NewContractRequestForm,
    title: 'New Contract Request',
    section: 'contract-lifecycle',
    subsection: 'contract-intake',
    breadcrumbs: ['Contract Lifecycle', 'Contract Intake', 'New Contract Request']
  },
  {
    path: '/contract-request-list',
    component: ContractRequestList,
    title: 'Contract Request List',
    section: 'contract-lifecycle',
    subsection: 'contract-intake',
    breadcrumbs: ['Contract Lifecycle', 'Contract Intake', 'Contract Request List']
  },
  {
    path: '/contract-request/:id',
    component: ContractIntakeDetail,
    title: 'Contract Request Details',
    section: 'contract-lifecycle',
    subsection: 'contract-intake',
    breadcrumbs: ['Contract Lifecycle', 'Contract Intake', 'Request Details'],
    dynamic: true
  },
  {
    path: '/contract-request-edit/:id',
    component: NewContractRequestForm,
    title: 'Edit Contract Request',
    section: 'contract-lifecycle',
    subsection: 'contract-intake',
    breadcrumbs: ['Contract Lifecycle', 'Contract Intake', 'Edit Request'],
    dynamic: true
  },
  {
    path: '/contract-draft-generator',
    component: ContractDraftGenerator,
    title: 'Contract Draft Generator',
    section: 'contract-lifecycle',
    subsection: 'contract-intake',
    breadcrumbs: ['Contract Lifecycle', 'Contract Intake', 'Draft Generator']
  },

  // Contract Lifecycle - Planning & Solicitation
  {
    path: '/solicitation-planner',
    component: SolicitationPlanning,
    title: 'Solicitation Planner',
    section: 'contract-lifecycle',
    subsection: 'planning-solicitation',
    breadcrumbs: ['Contract Lifecycle', 'Planning & Solicitation', 'Solicitation Planner']
  },

  // Contract Lifecycle - Proposal Evaluation
  {
    path: '/proposal-upload',
    component: ProposalUpload,
    title: 'Upload Proposals',
    section: 'contract-lifecycle',
    subsection: 'proposal-evaluation',
    breadcrumbs: ['Contract Lifecycle', 'Proposal Evaluation', 'Upload Proposals']
  },
  {
    path: '/contract-analyzer',
    component: ContractAnalyzer,
    title: 'Third-Party Analyzer',
    section: 'contract-lifecycle',
    subsection: 'proposal-evaluation',
    breadcrumbs: ['Contract Lifecycle', 'Proposal Evaluation', 'Third-Party Analyzer']
  },
  {
    path: '/renewal-intelligence',
    component: RenewalIntelligence,
    title: 'Renewal Intelligence',
    section: 'contract-lifecycle',
    subsection: 'proposal-evaluation',
    breadcrumbs: ['Contract Lifecycle', 'Proposal Evaluation', 'Renewal Intelligence']
  },
  {
    path: '/redlining-coach',
    component: RedliningCoach,
    title: 'Redlining Coach',
    section: 'contract-lifecycle',
    subsection: 'proposal-evaluation',
    breadcrumbs: ['Contract Lifecycle', 'Proposal Evaluation', 'Redlining Coach']
  },

  // Compliance Tools
  {
    path: '/clause-Checker',
    component: ClauseValidationInterface,
    title: 'Clause Checker (FAR/DFARS)',
    section: 'compliance',
    breadcrumbs: ['Compliance', 'Clause Checker (FAR/DFARS)']
  },
  {
    path: '/checklist-generator',
    component: ChecklistGenerator,
    title: 'Compliance Checklist Generator',
    section: 'compliance',
    breadcrumbs: ['Compliance', 'Compliance Checklist Generator']
  },

  // Contract Modifications
  {
    path: '/contract-modification-tracker',
    component: ContractModificationTracker,
    title: 'Log Modification',
    section: 'modifications',
    breadcrumbs: ['Modifications', 'Log Modification']
  },

  // Contract Closeout
  {
    path: '/closeout-checklist-wizard',
    component: CloseoutChecklistWizard,
    title: 'Closeout Wizard',
    section: 'closeout',
    breadcrumbs: ['Closeout', 'Closeout Wizard']
  },

  // Reports & Analytics
  {
    path: '/report/dashboard',
    component: ComplianceDashboard,
    title: 'Compliance Summary',
    section: 'reports',
    breadcrumbs: ['Reports', 'Compliance Summary']
  },

  // Administration
  {
    path: '/admin/user-management',
    component: UserManagement,
    title: 'User & Role Management',
    section: 'admin',
    breadcrumbs: ['Administration', 'User & Role Management']
  },
  {
    path: '/admin/audit-logs',
    component: AIAuditLogs,
    title: 'Audit Logs',
    section: 'admin',
    breadcrumbs: ['Administration', 'Audit Logs']
  }
];

// Helper functions for route management
export const getRouteByPath = (path) => {
  return routesConfig.find(route => {
    if (route.dynamic) {
      // Handle dynamic routes by creating a regex pattern
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return route.path === path;
  });
};

export const getRoutesBySection = (section) => {
  return routesConfig.filter(route => route.section === section);
};

export const getRoutesBySubsection = (subsection) => {
  return routesConfig.filter(route => route.subsection === subsection);
};

export const getAllSections = () => {
  const sections = [...new Set(routesConfig.map(route => route.section))];
  return sections.filter(Boolean);
};

export const getAllSubsections = () => {
  const subsections = [...new Set(routesConfig.map(route => route.subsection))];
  return subsections.filter(Boolean);
};

export const getNavigationStructure = () => {
  const structure = {};
  
  routesConfig.forEach(route => {
    if (!route.section) return;
    
    if (!structure[route.section]) {
      structure[route.section] = {
        routes: [],
        subsections: {}
      };
    }
    
    if (route.subsection) {
      if (!structure[route.section].subsections[route.subsection]) {
        structure[route.section].subsections[route.subsection] = [];
      }
      structure[route.section].subsections[route.subsection].push(route);
    } else {
      structure[route.section].routes.push(route);
    }
  });
  
  return structure;
};

// Route metadata for different purposes
export const routeMetadata = {
  requiresAuth: [
    '/admin/user-management',
    '/admin/audit-logs'
  ],
  publicRoutes: [
    '/'
  ],
  breadcrumbExceptions: {
    '/contract-request/:id': (params) => [
      'Contract Lifecycle', 
      'Contract Intake', 
      `Request #${params.id}`
    ],
    '/contract-request-edit/:id': (params) => [
      'Contract Lifecycle', 
      'Contract Intake', 
      `Edit Request #${params.id}`
    ]
  }
};

export default routesConfig;