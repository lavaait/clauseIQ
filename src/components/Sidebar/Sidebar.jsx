
import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import { X } from 'lucide-react';
import '../occ-colors.css'; 
import { useState } from 'react';
import { useLocation } from 'react-router-dom';


const Sidebar = ({ userRole, isOpen, setIsOpen }) => {
  const [ setActiveItem] = useState('/')
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-occ-blue-dark occ-secondary-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="p-4 border-b border-occ-blue flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              <img src="/logo192.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-semibold occ-secondary-white text-lg">ClauseIQ</span>
          </div>

          {/* Close button for mobile - positioned on the right */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-occ-blue rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation content */}
        <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
          {/* Dashboard Section */}
          <SidebarItem 
            emoji="🏠" 
            label="Home" 
            href="/"
            isActive={location.pathname === '/'}
            onClick={() => setActiveItem('/')}
          />
          <SidebarItem emoji="📊" label="Analytics & KPIs" />

          {/* Contract Lifecycle */}
          <SidebarSection title="Contract Lifecycle">
            <SidebarItem emoji="📥" label="Contract Intake" />
            <SidebarItem
              emoji="➕"
              label="New Contract Request"
              href="/new-contract-request"
              indent={1}
              isActive={location.pathname === '/new-contract-request'}
            />

            <SidebarItem emoji="📁" label="My Requests" indent={1} />
            <SidebarItem emoji="📜" label="Acquisition Strategy (AI)" indent={1} />
            <SidebarItem emoji="🧠" label="Planning & Solicitation" />
            <SidebarItem emoji="📆" label="Solicitation Planner" indent={1}
         
              href="/solicitation-planner"
              isActive={location.pathname === '/solicitation-planner'} />
            <SidebarItem emoji="🔍" label="Market Research Tracker" indent={1} />
            <SidebarItem emoji="✅" label="Pre-Solicitation Checklist" indent={1} />
            <SidebarItem emoji="📑" label="Proposal Evaluation" />
            <SidebarItem emoji="📤" label="Upload Proposals" indent={1} />
            <SidebarItem emoji="🧠" label="AI Evaluation Summary" indent={1} />
            <SidebarItem emoji="🏆" label="Award Recommendation" indent={1} />
            <SidebarItem emoji="📋" label="Performance Monitoring" />
            <SidebarItem emoji="📈" label="Active Contracts" indent={1} />
            <SidebarItem emoji="🚨" label="Risk & KPI Dashboard" indent={1} />
            <SidebarItem emoji="📤" label="Upload Performance Reports" indent={1} />
            <SidebarItem emoji="🛠️" label="Modifications" />
            <SidebarItem emoji="🔧" label="Log Modification" indent={1} />
            <SidebarItem emoji="📉" label="Impact Tracker" indent={1} />
            <SidebarItem emoji="✅" label="Closeout" />
            <SidebarItem emoji="📦" label="Closeout Wizard" indent={1} />
            <SidebarItem emoji="🧾" label="Final Invoice Review" indent={1} />
            <SidebarItem emoji="📁" label="Closeout History" indent={1} />
          </SidebarSection>

          {/* Compliance Tools */}
          <SidebarSection title="Compliance Tools">
            <SidebarItem emoji="📚" label="Clause Checker (FAR/DFARS)" />
            <SidebarItem emoji="🗂️" label="Compliance Checklist Generator" />
            <SidebarItem emoji="🛡️" label="Policy Alignment Validator" />
          </SidebarSection>

          {/* AI & Logs */}
          <SidebarSection title="AI & Logs">
            <SidebarItem emoji="🤖" label="AI Decision Logs" />
            <SidebarItem emoji="🔁" label="Model Feedback" />
            <SidebarItem emoji="📅" label="Timeline Drift Predictor" />
          </SidebarSection>

          {/* Search & Discovery */}
          <SidebarSection title="Search & Discovery">
            <SidebarItem emoji="🔍" label="Smart Contract Search" />
            <SidebarItem emoji="🗂️" label="Archive Access" />
            <SidebarItem emoji="📌" label="Saved Views & Filters" />
          </SidebarSection>

          {/* Reports & Exports */}
          <SidebarSection title="Reports & Exports">
            <SidebarItem emoji="📄" label="Compliance Summary" />
            <SidebarItem emoji="📊" label="Contract Portfolio Reports" />
            <SidebarItem emoji="📁" label="Export to Excel/PDF" />
          </SidebarSection>

          {/* Administration (Admin only) */}
          {userRole === 'Admin' && (
            <SidebarSection title="Administration">
              <SidebarItem emoji="👤" label="User & Role Management" />
              <SidebarItem emoji="🔐" label="Access Policies & Workflow Rules" />
              <SidebarItem emoji="🔧" label="System Configuration" />
              <SidebarItem emoji="🧾" label="Audit Export Logs" />
            </SidebarSection>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;