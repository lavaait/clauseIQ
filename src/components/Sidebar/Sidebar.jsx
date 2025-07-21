import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';
import { 
  X, 
  Home, 
  BarChart3, 
  Download, 
  Plus, 
  FolderOpen, 
  FileText, 
  Brain, 
  Calendar, 
  Search, 
  CheckSquare, 
  Upload, 
  Trophy, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  TrendingDown, 
  Package, 
  Receipt, 
  Archive, 
  Book, 
  ClipboardList, 
  Shield, 
  Bot, 
  RotateCcw, 
  BookmarkPlus, 
  Users, 
  Lock, 
  Cog, 
  FileDown
} from 'lucide-react';
import '../occ-colors.css'; 
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ userRole, isOpen, setIsOpen }) => {
  const [setActiveItem] = useState('/')
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
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-occ-blue flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Enlarged logo container */}
            <div className="w-20 h-20 flex items-center justify-center bg-white rounded-xl shadow-lg p-3">
              <img 
                src="/logo192.png" 
                alt="ClauseIQ Logo" 
                className="w-full h-full object-contain filter brightness-110 contrast-125"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback icon if logo fails to load */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm hidden">
                <FileText size={28} />
              </div>
            </div>
            {/* Separate ClauseIQ name */}
            <div className="flex flex-col">
              <span className="font-bold occ-secondary-white text-3xl leading-tight">ClauseIQ</span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-occ-blue rounded-lg transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Navigation content - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#005ACA #001D4F'
          }}>
          <nav className="py-4 pb-8">
            {/* Dashboard Section */}
            <SidebarItem 
              icon={<Home size={18} />} 
              label="Home" 
              href="/"
              isActive={location.pathname === '/'}
              onClick={() => setActiveItem('/')}
            />
            <SidebarItem icon={<BarChart3 size={18} />} label="Analytics & KPIs" />

            {/* Contract Lifecycle */}
            <SidebarSection title="Contract Lifecycle">
              <SidebarItem icon={<Download size={18} />} label="Contract Intake" />
              <SidebarItem
                icon={<Plus size={18} />}
                label="New Contract Request"
                href="/new-contract-request"
                indent={1}
                isActive={location.pathname === '/new-contract-request'}
              />

              <SidebarItem icon={<FolderOpen size={18} />} label="My Requests" indent={1} />
              <SidebarItem icon={<FileText size={18} />} label="Acquisition Strategy (AI)" indent={1} />
              <SidebarItem icon={<Brain size={18} />} label="Planning & Solicitation" />
              
              <SidebarItem 
                icon={<Calendar size={18} />} 
                label="Solicitation Planner" 
                indent={1}
                href="/solicitation-planner"
                isActive={location.pathname === '/solicitation-planner'} />
                
              <SidebarItem icon={<Search size={18} />} label="Market Research Tracker" indent={1} />
              <SidebarItem icon={<CheckSquare size={18} />} label="Pre-Solicitation Checklist" indent={1} />
              <SidebarItem icon={<ClipboardList size={18} />} label="Proposal Evaluation" />

              <SidebarItem 
                icon={<Upload size={18} />} 
                label="Upload Proposals" 
                indent={1} 
                href={"/proposal-upload"}
                isActive={location.pathname === '/proposal-upload'}/>

              <SidebarItem icon={<Brain size={18} />} label="AI Evaluation Summary" indent={1} />
              <SidebarItem icon={<Trophy size={18} />} label="Award Recommendation" indent={1} />
              <SidebarItem icon={<Activity size={18} />} label="Performance Monitoring" />
              <SidebarItem icon={<TrendingUp size={18} />} label="Active Contracts" indent={1} />
              <SidebarItem icon={<AlertTriangle size={18} />} label="Risk & KPI Dashboard" indent={1} />
              <SidebarItem icon={<Upload size={18} />} label="Upload Performance Reports" indent={1} />
              <SidebarItem icon={<Settings size={18} />} label="Modifications" />
              <SidebarItem 
                icon={<Cog size={18} />} 
                label="Log Modification" 
                indent={1}  
                href={"/contract-modification-tracker"}
                isActive={location.pathname ==="/contract-modification-tracker"} />
              <SidebarItem 
                icon={<TrendingDown 
                size={18} />} 
                label="Impact Tracker" 
                indent={1}
               
               />
              <SidebarItem icon={<CheckSquare size={18} />} label="Closeout" />
              <SidebarItem icon={<Package size={18} />} 
                label="Closeout Wizard" 
                indent={1}
                href={"/closeout-checklist-wizard"} 
                isActive={location.pathname === "/closeout-checklist-wizard"}/>
              <SidebarItem icon={<Receipt size={18} />} label="Final Invoice Review" indent={1} />
              <SidebarItem icon={<Archive size={18} />} label="Closeout History" indent={1} />
            </SidebarSection>

            {/* Compliance Tools */}
            <SidebarSection title="Compliance Tools">
              <SidebarItem icon={<Book size={18} />} 
                label="Clause Checker (FAR/DFARS)" 
                index={1}
                href={"/clause-Checker"}
                isActive={location.pathname === '/clause-Checker'}
              />
              <SidebarItem 
                icon={<ClipboardList size={18} />} 
                label="Compliance Checklist Generator" 
                index={1}
                href={"/checklist-generator"}
                isActive={location.pathname ==="/checklist-generator"}
              />
              <SidebarItem icon={<Shield size={18} />} label="Policy Alignment Validator" />
            </SidebarSection>

            {/* AI & Logs */}
            <SidebarSection title="AI & Logs">
              <SidebarItem icon={<Bot size={18} />} label="AI Decision Logs" />
              <SidebarItem icon={<RotateCcw size={18} />} label="Model Feedback" />
              <SidebarItem icon={<Calendar size={18} />} label="Timeline Drift Predictor" />
            </SidebarSection>

            {/* Search & Discovery */}
            <SidebarSection title="Search & Discovery">
              <SidebarItem icon={<Search size={18} />} label="Smart Contract Search" />
              <SidebarItem icon={<Archive size={18} />} label="Archive Access" />
              <SidebarItem icon={<BookmarkPlus size={18} />} label="Saved Views & Filters" />
            </SidebarSection>

            {/* Reports & Exports */}
            <SidebarSection title="Reports & Exports">
              <SidebarItem icon={<FileText size={18} />} label="Compliance Summary" />
              <SidebarItem icon={<BarChart3 size={18} />} label="Contract Portfolio Reports" />
              <SidebarItem icon={<FileDown size={18} />} label="Export to Excel/PDF" />
            </SidebarSection>

           
              <SidebarSection title="Administration">
                <SidebarItem 
                  icon={<Users size={18} />} 
                  label="User & Role Management" 
                  href="/admin/user-management"
                  isActive={location.pathname === '/admin/user-management'}
                />
                <SidebarItem 
                  icon={<Lock size={18} />} 
                  label="Access Policies & Workflow Rules" 
                 
                />
                <SidebarItem 
                  icon={<Cog size={18} />} 
                  label="System Configuration" 
                  
                />
                <SidebarItem 
                  icon={<FileDown size={18} />} 
                  label="Audit Export Logs" 
                  href="/admin/audit-logs"
                  isActive={location.pathname === '/admin/audit-logs'}
                />
              </SidebarSection>
         
          </nav>
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        /* Custom scrollbar for webkit browsers */
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #001D4F;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #005ACA;
          border-radius: 3px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #0072C6;
        }
      `}</style>
    </>
  );
};

export default Sidebar;