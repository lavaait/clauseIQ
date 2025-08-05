import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';

const MainLayout = ({ children, title = "Dashboard", userRole = "Contract Manager" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content area with proper sidebar offset */}
      <div className={`
        flex flex-col min-h-screen transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-80'}
      `}>
        <Topbar title={title} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 w-full overflow-x-hidden p-4">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;