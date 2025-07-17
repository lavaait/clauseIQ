import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import NewContractRequestForm from './components/Contract-Intake/NewContractRequestForm';
import SolicitationPlanning from './components/Solicitation-Planner/SolicitationPlanning';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-contract-request" element={<NewContractRequestForm />} />
        <Route path="/solicitation-planner" element={<SolicitationPlanning />} />
      </Routes>
    </Router>
  );
};

export default App;
