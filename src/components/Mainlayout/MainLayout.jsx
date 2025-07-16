import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header';

const MainLayout = ({ children, title = "Dashboard", userRole = "Contract Manager" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title={title} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
