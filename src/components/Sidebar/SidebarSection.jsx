import React from 'react';
import '../occ-colors.css';

const SidebarSection = ({ title, children }) => {
  return (
    <div className="mb-2">
      <div className="px-4 py-2 text-xs font-semibold occ-secondary-gray uppercase tracking-wider">
        {title}
      </div>
      {children}
    </div>
  );
};

export default SidebarSection;