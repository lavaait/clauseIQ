import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../occ-colors.css';

import SidebarSection from './SidebarSection';
import SidebarItem from './SidebarItem';

import { X, Home, BarChart3, Download, Plus, FileText, Brain, Calendar, CheckSquare, Upload, Settings, Package, Book, ClipboardList, Shield, Users, Lock, Cog, FileDown, ChevronDown, ChevronRight, Scale } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [expandedSections, setExpandedSections] = useState({
    'contract-lifecycle': false, 
    'modifications': false,
    'closeout': false,
    'compliance': false,
    'reports': false,
    'admin': false
  });

  const [expandedSubsections, setExpandedSubsections] = useState({
    'contract-intake': false,
    'planning-solicitation': false,
    'proposal-evaluation': false
  });

  const location = useLocation();
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);
  const shouldScrollToActive = useRef(false);
  const isInitialLoad = useRef(true);

  // Auto-expand sections and conditionally scroll to active item
  useEffect(() => {
    const currentPath = location.pathname;

    // Define which section each route belongs to
    const routeToSection = {
      '/new-contract-request': 'contract-lifecycle',
      '/contract-request-list': 'contract-lifecycle',
      '/contract-draft-generator': 'contract-lifecycle',
      '/solicitation-planner': 'contract-lifecycle',
      '/proposal-upload': 'contract-lifecycle',
      '/proposal-analysis': 'contract-lifecycle',
      '/contract-analyzer': 'contract-lifecycle', 
      '/renewal-intelligence' : 'contract-lifecycle',
       '/redlining-coach': 'contract-lifecycle',

      '/contract-modification-tracker': 'modifications',
      '/closeout-checklist-wizard': 'closeout',
      '/clause-Checker': 'compliance',
      '/checklist-generator': 'compliance',
      '/report/dashboard': 'reports',
      '/admin/user-management': 'admin',
      '/admin/audit-logs': 'admin'
    };

    // Define which subsection each route belongs to
    const routeToSubsection = {
      '/new-contract-request': 'contract-intake',
      '/contract-request-list': 'contract-intake',
      '/contract-draft-generator': 'contract-intake',
      '/solicitation-planner': 'planning-solicitation',
      '/proposal-upload': 'proposal-evaluation',
      '/proposal-analysis': 'proposal-evaluation',
      '/contract-analyzer': 'proposal-evaluation', 
      '/renewal-intelligence': 'proposal-evaluation',
      '/redlining-coach': 'proposal-evaluation',
    };

    // Only auto-expand if we're not on the dashboard and it's not the initial load
    const activeSection = routeToSection[currentPath];
    const activeSubsection = routeToSubsection[currentPath];
    
    if (activeSection && currentPath !== '/' && !isInitialLoad.current) {
      setExpandedSections(prev => {
        const wasExpanded = prev[activeSection];
        
        if (!wasExpanded) {
          shouldScrollToActive.current = true;
        }
        
        return {
          ...prev,
          [activeSection]: true
        };
      });

      if (activeSubsection) {
        setExpandedSubsections(prev => ({
          ...prev,
          [activeSubsection]: true
        }));
      }

      if (shouldScrollToActive.current) {
        setTimeout(() => {
          const activeElement = sidebarRef.current?.querySelector('[data-active="true"]');
          if (activeElement && sidebarRef.current) {
            const sidebarScrollContainer = sidebarRef.current.querySelector('.sidebar-scroll');
            if (sidebarScrollContainer) {
              const currentScrollTop = sidebarScrollContainer.scrollTop;
              const containerHeight = sidebarScrollContainer.clientHeight;
              
              const elementTop = activeElement.offsetTop;
              const elementHeight = activeElement.offsetHeight;
              
              const elementBottom = elementTop + elementHeight;
              const visibleTop = currentScrollTop;
              const visibleBottom = currentScrollTop + containerHeight;
              
              if (elementTop < visibleTop || elementBottom > visibleBottom) {
                const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
                
                sidebarScrollContainer.scrollTo({
                  top: Math.max(0, scrollTop),
                  behavior: 'smooth'
                });
              }
            }
          }
          
          shouldScrollToActive.current = false;
        }, 100);
      }
    }

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [location.pathname]);

  // Focus management for mobile sidebar
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, setIsOpen]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleSubsection = (subsectionId) => {
    setExpandedSubsections(prev => ({
      ...prev,
      [subsectionId]: !prev[subsectionId]
    }));
  };

  const handleNavigation = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleSidebarItemClick = (href) => {
    if (href && href !== location.pathname) {
      shouldScrollToActive.current = true;
    }
    handleNavigation();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
          onClick={() => setIsOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Container - Now always fixed and sticky */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50
          w-80 bg-occ-blue-dark text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          h-screen
        `}
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          height: '100vh',
          overflowY: 'hidden'
        }}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-4 border-b border-occ-blue flex items-center justify-between bg-occ-blue-dark sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="h-9 w-9 flex items-center justify-center bg-white shadow-lg rounded-lg">
              <img
                src={`${process.env.PUBLIC_URL}/logo192.png`}
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
              <span className="text-blue-300 font-bold text-4xl leading-none">IQ</span>
            </div>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-occ-blue rounded-lg transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            aria-label="Close sidebar"
            type="button"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Sidebar Navigation - Scrollable content */}
        <div 
          className="flex-1 overflow-y-auto sidebar-scroll scrollbar-thin scrollbar-thumb-occ-blue scrollbar-track-occ-blue-dark"
          style={{
            maxHeight: 'calc(100vh - 80px)', // Subtract header height
            overflowY: 'auto',
            scrollBehavior: 'smooth'
          }}
        >
          <nav className="pb-8 px-2" role="menu">
            
            {/* Main Dashboard */}
            <SidebarSection title="Main">
              <SidebarItem
                icon={<Home size={18} />}
                label="Dashboard"
                href="/"
                isActive={location.pathname === '/'}
                onClick={() => handleSidebarItemClick('/')}
              />
            </SidebarSection>

            {/* Contract Lifecycle */}
            <SidebarSection 
              title="Contract Lifecycle"
              expandable={true}
              expanded={expandedSections['contract-lifecycle']}
              onToggle={() => toggleSection('contract-lifecycle')}
            >
              {expandedSections['contract-lifecycle'] && (
                <>
                  {/* Contract Intake - Expandable Subsection */}
                  <div 
                    className="flex items-center justify-between px-4 py-2 hover:bg-occ-blue rounded-lg cursor-pointer transition-colors duration-200 mx-2"
                    onClick={() => toggleSubsection('contract-intake')}
                  >
                    <div className="flex items-center space-x-3">
                      <Download size={18} />
                      <span className="text-sm font-medium">Contract Intake</span>
                    </div>
                    {expandedSubsections['contract-intake'] ? 
                      <ChevronDown size={16} className="text-gray-300" /> : 
                      <ChevronRight size={16} className="text-gray-300" />
                    }
                  </div>
                  
                  {expandedSubsections['contract-intake'] && (
                    <>
                      <SidebarItem
                        icon={<Plus size={18} />}
                        label="New Contract Request"
                        href="/new-contract-request"
                        indent={1}
                        isActive={location.pathname === '/new-contract-request'}
                        onClick={() => handleSidebarItemClick('/new-contract-request')}
                      />
                      <SidebarItem
                        icon={<ClipboardList size={18} />}
                        label="Contract Request List"
                        href="/contract-request-list"
                        indent={1}
                        isActive={location.pathname === '/contract-request-list'}
                        onClick={() => handleSidebarItemClick('/contract-request-list')}
                      />
                      <SidebarItem
                        icon={<FileText size={18} />}
                        label="Contract Draft Generator"
                        href="/contract-draft-generator"
                        indent={1}
                        isActive={location.pathname === '/contract-draft-generator'}
                        onClick={() => handleSidebarItemClick('/contract-draft-generator')}
                      />
                    </>
                  )}

                  {/* Planning & Solicitation - Expandable Subsection */}
                  <div 
                    className="flex items-center justify-between px-4 py-2 hover:bg-occ-blue rounded-lg cursor-pointer transition-colors duration-200 mx-2"
                    onClick={() => toggleSubsection('planning-solicitation')}
                  >
                    <div className="flex items-center space-x-3">
                      <Brain size={18} />
                      <span className="text-sm font-medium">Planning & Solicitation</span>
                    </div>
                    {expandedSubsections['planning-solicitation'] ? 
                      <ChevronDown size={16} className="text-gray-300" /> : 
                      <ChevronRight size={16} className="text-gray-300" />
                    }
                  </div>
                  
                  {expandedSubsections['planning-solicitation'] && (
                    <SidebarItem
                      icon={<Calendar size={18} />}
                      label="Solicitation Planner"
                      indent={1}
                      href="/solicitation-planner"
                      isActive={location.pathname === '/solicitation-planner'}
                      onClick={() => handleSidebarItemClick('/solicitation-planner')}
                    />
                  )}

                  {/* Proposal Evaluation - Expandable Subsection */}
                  <div 
                    className="flex items-center justify-between px-4 py-2 hover:bg-occ-blue rounded-lg cursor-pointer transition-colors duration-200 mx-2"
                    onClick={() => toggleSubsection('proposal-evaluation')}
                  >
                    <div className="flex items-center space-x-3">
                      <ClipboardList size={18} />
                      <span className="text-sm font-medium">Proposal Evaluation</span>
                    </div>
                    {expandedSubsections['proposal-evaluation'] ? 
                      <ChevronDown size={16} className="text-gray-300" /> : 
                      <ChevronRight size={16} className="text-gray-300" />
                    }
                  </div>
                  
                  {expandedSubsections['proposal-evaluation'] && (
                    <>
                      <SidebarItem
                        icon={<Upload size={18} />}
                        label="Upload Proposals"
                        indent={1}
                        href="/proposal-upload"
                        isActive={location.pathname === '/proposal-upload'}
                        onClick={() => handleSidebarItemClick('/proposal-upload')}
                      />
                      <SidebarItem
                        icon={<Scale size={18} />}
                        label="Third-Party Analyzer"
                        indent={1}
                        href="/contract-analyzer"
                        isActive={location.pathname === '/contract-analyzer'}
                        onClick={() => handleSidebarItemClick('/contract-analyzer')}
                      />
                      <SidebarItem
                        icon={<Scale size={18} />}
                        label="Renewal Intelligence"
                        indent={1}
                        href="/renewal-intelligence"
                        isActive={location.pathname === '/renewal-intelligence'}
                        onClick={() => handleSidebarItemClick('/renewal-intelligence')}
                      />
                       <SidebarItem
                        icon={<Scale size={18} />}
                        label="Redlining Coach"
                        indent={1}
                        href="/redlining-coach"
                        isActive={location.pathname === '/redlining-coach'}
                        onClick={() => handleSidebarItemClick('/redlining-coach')}
                      />
                    </>
                  )}
                </>
              )}
            </SidebarSection>

            {/* Modifications */}
            <SidebarSection 
              title="Modifications"
              expandable={true}
              expanded={expandedSections['modifications']}
              onToggle={() => toggleSection('modifications')}
            >
              <SidebarItem 
                icon={<Settings size={18} />} 
                label="Modifications"
              />
              
              {expandedSections['modifications'] && (
                <SidebarItem
                  icon={<Cog size={18} />}
                  label="Log Modification"
                  indent={1}
                  href="/contract-modification-tracker"
                  isActive={location.pathname === '/contract-modification-tracker'}
                  onClick={() => handleSidebarItemClick('/contract-modification-tracker')}
                />
              )}
            </SidebarSection>

            {/* Closeout */}
            <SidebarSection 
              title="Closeout"
              expandable={true}
              expanded={expandedSections['closeout']}
              onToggle={() => toggleSection('closeout')}
            >
              <SidebarItem 
                icon={<CheckSquare size={18} />} 
                label="Closeout"
              />
              
              {expandedSections['closeout'] && (
                <SidebarItem
                  icon={<Package size={18} />}
                  label="Closeout Wizard"
                  indent={1}
                  href="/closeout-checklist-wizard"
                  isActive={location.pathname === '/closeout-checklist-wizard'}
                  onClick={() => handleSidebarItemClick('/closeout-checklist-wizard')}
                />
              )}
            </SidebarSection>

            {/* Compliance Tools */}
            <SidebarSection 
              title="Compliance"
              expandable={true}
              expanded={expandedSections['compliance']}
              onToggle={() => toggleSection('compliance')}
            >
              <SidebarItem 
                icon={<Shield size={18} />} 
                label="Compliance Tools"
              />
              
              {expandedSections['compliance'] && (
                <>
                  <SidebarItem
                    icon={<Book size={18} />}
                    label="Clause Checker (FAR/DFARS)"
                    indent={1}
                    href="/clause-Checker"
                    isActive={location.pathname === '/clause-Checker'}
                    onClick={() => handleSidebarItemClick('/clause-Checker')}
                  />
                  <SidebarItem
                    icon={<ClipboardList size={18} />}
                    label="Compliance Checklist Generator"
                    indent={1}
                    href="/checklist-generator"
                    isActive={location.pathname === '/checklist-generator'}
                    onClick={() => handleSidebarItemClick('/checklist-generator')}
                  />
                </>
              )}
            </SidebarSection>

            {/* Reports & Exports */}
            <SidebarSection 
              title="Reports"
              expandable={true}
              expanded={expandedSections['reports']}
              onToggle={() => toggleSection('reports')}
            >
              <SidebarItem 
                icon={<BarChart3 size={18} />} 
                label="Reports & Exports"
              />
              
              {expandedSections['reports'] && (
                <SidebarItem
                  icon={<FileText size={18} />}
                  label="Compliance Summary"
                  indent={1}
                  href="/report/dashboard"
                  isActive={location.pathname === '/report/dashboard'}
                  onClick={() => handleSidebarItemClick('/report/dashboard')}
                />
              )}
            </SidebarSection>

            {/* Administration */}
            <SidebarSection 
              title="Administration"
              expandable={true}
              expanded={expandedSections['admin']}
              onToggle={() => toggleSection('admin')}
            >
              <SidebarItem 
                icon={<Lock size={18} />} 
                label="Administration"
              />
              
              {expandedSections['admin'] && (
                <>
                  <SidebarItem
                    icon={<Users size={18} />}
                    label="User & Role Management"
                    indent={1}
                    href="/admin/user-management"
                    isActive={location.pathname === '/admin/user-management'}
                    onClick={() => handleSidebarItemClick('/admin/user-management')}
                  />
                  <SidebarItem
                    icon={<FileDown size={18} />}
                    label="Audit Logs"
                    indent={1}
                    href="/admin/audit-logs"
                    isActive={location.pathname === '/admin/audit-logs'}
                    onClick={() => handleSidebarItemClick('/admin/audit-logs')}
                  />
                </>
              )}
            </SidebarSection>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;