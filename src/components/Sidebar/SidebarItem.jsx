import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';

const SidebarItem = forwardRef(({ 
  icon, 
  label, 
  indent = 0, 
  href, 
  isActive, 
  onClick,
  expandable = false,
  expanded = false,
  onToggle,
  parentLabel
}, ref) => {

  const baseClassName = `
    group flex items-center w-full px-4 py-3 text-left transition-all duration-200
    ${indent > 0 ? `pl-${8 + indent * 4}` : ''}
    ${isActive 
      ? 'bg-blue-600 text-white shadow-lg border-r-4 border-blue-300' 
      : 'hover:bg-blue-700 hover:bg-opacity-30 text-gray-100 hover:text-white'
    }
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 focus:ring-inset
    focus:bg-blue-700 focus:bg-opacity-50
    relative
  `;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (expandable && onToggle) {
        onToggle();
      } else if (onClick) {
        onClick();
      }
    }
    
    // Arrow key navigation for expandable items
    if (expandable) {
      if (e.key === 'ArrowRight' && !expanded) {
        e.preventDefault();
        onToggle && onToggle();
      } else if (e.key === 'ArrowLeft' && expanded) {
        e.preventDefault();
        onToggle && onToggle();
      }
    }
  };

  const itemContent = (
    <>
      <span className="mr-3 flex-shrink-0 text-gray-300 group-hover:text-white group-focus:text-white">
        {icon}
      </span>
      <span className="text-sm font-medium flex-1 truncate">
        {label}
      </span>
      {expandable && (
        <span className="ml-2 flex-shrink-0 text-gray-400 group-hover:text-white group-focus:text-white">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
      
      {/* Visual indicator for active state */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-r"></div>
      )}
    </>
  );

  // Create proper ARIA attributes
  const ariaProps = {
    role: expandable ? 'button' : (href ? 'link' : 'menuitem'),
    'aria-expanded': expandable ? expanded : undefined,
    'aria-current': isActive ? 'page' : undefined,
    'aria-describedby': parentLabel ? `parent-${parentLabel}` : undefined,
    tabIndex: 0
  };

  if (href && !expandable) {
    return (
      <Link 
        ref={ref}
        to={href} 
        className={baseClassName}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...ariaProps}
      >
        {itemContent}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={baseClassName}
      onClick={() => {
        if (expandable && onToggle) {
          onToggle();
        } else if (onClick) {
          onClick();
        }
      }}
      onKeyDown={handleKeyDown}
      {...ariaProps}
    >
      {itemContent}
      
      {/* Screen reader helper text */}
      {expandable && (
        <span className="sr-only">
          {expanded ? 'Collapse' : 'Expand'} {label} section
        </span>
      )}
      
      {parentLabel && (
        <span id={`parent-${parentLabel}`} className="sr-only">
          Subsection of {parentLabel}
        </span>
      )}
    </button>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;