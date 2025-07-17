import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ emoji, label, indent = 0, href, isActive, onClick }) => {

  const baseClassName = `
    flex items-center px-4 py-2 cursor-pointer transition-colors duration-200
    ${indent > 0 ? `pl-${8 + indent * 4}` : ''}
    ${isActive 
      ? 'bg-occ-blue text-white' 
      : 'hover:bg-occ-blue-light hover:bg-opacity-20 text-occ-secondary-white'
    }
  `;

  const itemContent = (
    <>
      <span className="mr-3 text-lg">{emoji}</span>
      <span className="text-sm">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link 
        to={href} 
        className={baseClassName}
        onClick={onClick}
      >
        {itemContent}
      </Link>
    );
  }

  return (
    <div
      className={baseClassName}
      onClick={onClick}
    >
      {itemContent}
    </div>
  );
};

export default SidebarItem;
