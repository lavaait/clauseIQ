// SidebarItem.jsx
import React from 'react';
import '../occ-colors.css';

const SidebarItem = ({ emoji, label, active = false, indent = 0 }) => {
  return (
    <div 
      className={`flex items-center px-4 py-2 text-sm cursor-pointer transition-colors ${
        active ? 'bg-occ-blue occ-secondary-white' : 'occ-secondary-gray hover:bg-occ-blue hover:occ-secondary-white'
      }`}
      style={{ paddingLeft: `${16 + indent * 16}px` }}
    >
      {emoji && <span className="mr-3 text-lg">{emoji}</span>}
      {label}
    </div>
  );
};

export default SidebarItem;