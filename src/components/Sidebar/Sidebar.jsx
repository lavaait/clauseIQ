// Sidebar.jsx

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../occ-colors.css';

import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';

import {
  X, Home, BarChart3, Download, Plus, FolderOpen, FileText, Brain,
  Calendar, Search, CheckSquare, Upload, Trophy, Activity, TrendingUp,
  AlertTriangle, Settings, TrendingDown, Package, Receipt, Archive, Book,
  ClipboardList, Shield, Bot, RotateCcw, BookmarkPlus, Users, Lock, Cog,
  FileDown
} from 'lucide-react';

const Sidebar = ({ userRole, isOpen, setIsOpen }) => {
  const [setActiveItem] = useState('/');
  const location = useLocation();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-occ-blue-dark occ-secondary-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >

        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-occ-blue flex items-center justify-between">
          <div className="flex items-center space-x-4">

            {/* Logo */}
            <div className="h-9 w-9 flex items-center justify-center bg-white shadow-lg rounded-lg">
              <img
                src="/logo192.png"
                alt="ClauseIQ Icon"
                className="w-full h-full object-contain"
                style={{
                  filter: 'contrast(1.2) saturate(1.1) brightness(1.1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-sm hidden">
                <FileText size={20} />
              </div>
            </div>

            {/* Company Name */}
            <div className="flex items-center h-12">
              <span className="font-bold text-4xl leading-none">Clause</span>
              <span className="occ-secondary-blue font-bold text-4xl leading-none">IQ</span>
            </div>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-occ-blue rounded-lg transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <nav className="pb-8">
            <SidebarSection>

              {/* Dashboard */}
              <SidebarItem
                icon={<Home size={18} />}
                label="Dashboard"
                href="/"
                isActive={location.pathname === '/'}
                onClick={() => setActiveItem('/')}
              />

              {/* Contract Lifecycle */}
              <SidebarItem icon={<Download size={18} />} label="Contract Intake" />
              <SidebarItem
                icon={<Plus size={18} />}
                label="New Contract Request"
                href="/new-contract-request"
                indent={1}
                isActive={location.pathname === '/new-contract-request'}
              />
              <SidebarItem icon={<Brain size={18} />} label="Planning & Solicitation" />
              <SidebarItem
                icon={<Calendar size={18} />}
                label="Solicitation Planner"
                indent={1}
                href="/solicitation-planner"
                isActive={location.pathname === '/solicitation-planner'}
              />
              <SidebarItem icon={<ClipboardList size={18} />} label="Proposal Evaluation" />
              <SidebarItem
                icon={<Upload size={18} />}
                label="Upload Proposals"
                indent={1}
                href="/proposal-upload"
                isActive={location.pathname === '/proposal-upload'}
              />
              <SidebarItem
                icon={<Brain size={18} />}
                label="AI Evaluation Summary"
                indent={1}
                href="/proposal-analysis"
                isActive={location.pathname === '/proposal-analysis'}
              />

              {/* Modifications */}
              <SidebarItem icon={<Settings size={18} />} label="Modifications" />
              <SidebarItem
                icon={<Cog size={18} />}
                label="Log Modification"
                indent={1}
                href="/contract-modification-tracker"
                isActive={location.pathname === '/contract-modification-tracker'}
              />

              {/* Closeout */}
              <SidebarItem icon={<CheckSquare size={18} />} label="Closeout" />
              <SidebarItem
                icon={<Package size={18} />}
                label="Closeout Wizard"
                indent={1}
                href="/closeout-checklist-wizard"
                isActive={location.pathname === '/closeout-checklist-wizard'}
              />

              {/* Compliance Tools */}
              <SidebarItem icon={<Shield size={18} />} label="Compliance Tools" />
              <SidebarItem
                icon={<Book size={18} />}
                label="Clause Checker (FAR/DFARS)"
                indent={1}
                href="/clause-Checker"
                isActive={location.pathname === '/clause-Checker'}
              />
              <SidebarItem
                icon={<ClipboardList size={18} />}
                label="Compliance Checklist Generator"
                indent={1}
                href="/checklist-generator"
                isActive={location.pathname === '/checklist-generator'}
              />

              {/* Reports & Exports */}
              <SidebarItem icon={<BarChart3 size={18} />} label="Reports & Exports" />
              <SidebarItem
                icon={<FileText size={18} />}
                label="Compliance Summary"
                indent={1}
                href="/report/dashboard"
                isActive={location.pathname === '/report/dashboard'}
              />

              {/* Administration */}
              <SidebarItem icon={<Lock size={18} />} label="Administration" />
              <SidebarItem
                icon={<Users size={18} />}
                label="User & Role Management"
                indent={1}
                href="/admin/user-management"
                isActive={location.pathname === '/admin/user-management'}
              />
              <SidebarItem
                icon={<FileDown size={18} />}
                label="Audit Export Logs"
                indent={1}
                href="/admin/audit-logs"
                isActive={location.pathname === '/admin/audit-logs'}
              />
            </SidebarSection>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
