import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import NewContractRequestForm from './components/Contract-Intake/NewContractRequestForm';
import SolicitationPlanning from './components/Solicitation-Planner/SolicitationPlanning';
import ProposalUpload from './components/Proposal/ProposalUpload';
import ClauseValidationInterface from './components/Clause-Compliance/ClauseValidationInterface';
import ChecklistGenerator from './components/Clause-Compliance/ChecklistGenerator';
import ContractModificationTracker from './components/Modifications/ContractModificationTracker';
import CloseoutChecklistWizard from './components/Closeout/CloseoutChecklistWizard';
import UserManagement from './components/Admin/UserManagement';
import AIAuditLogs from './components/Admin/AIAuditLogs';
import ComplianceDashboard from './components/Reports-Exports/ComplianceDashboard';
import ContractRequestList from './components/Contract-Intake/ContractRequestList';
const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-contract-request" element={<NewContractRequestForm />} />
        <Route path="/solicitation-planner" element={<SolicitationPlanning />} />
        <Route path="/proposal-upload"  element={<ProposalUpload />}/>   
        <Route path="/clause-Checker" element={<ClauseValidationInterface/>} />
        <Route path="/checklist-generator" element={<ChecklistGenerator/>} />
        <Route path='/contract-modification-tracker'element={<ContractModificationTracker/>} />
        <Route path="/closeout-checklist-wizard"  element={<CloseoutChecklistWizard />}/>   
        <Route path="/admin/user-management"  element={<UserManagement />}/>
        <Route path="/admin/audit-logs"  element={<AIAuditLogs />}/>   
        <Route path='/report/dashboard'element={<ComplianceDashboard/>} />
        <Route path="/Contract-request-list" element={<ContractRequestList/> } />
      </Routes>
    </Router>
  );
};

export default App;
