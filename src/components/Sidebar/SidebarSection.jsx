import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import '../occ-colors.css';

const SidebarSection = ({ 
  title, 
  children, 
  expandable = false, 
  expanded = true, 
  onToggle 
}) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(expanded ? 'auto' : '0px');

  useEffect(() => {
    if (contentRef.current) {
      if (expanded) {
        setHeight(`${contentRef.current.scrollHeight}px`);
        // Set to auto after transition to allow for dynamic content
        setTimeout(() => setHeight('auto'), 300);
      } else {
        setHeight('0px');
      }
    }
  }, [expanded, children]);
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (expandable && onToggle) {
      onToggle();
    }
  };

  const handleKeyDown = (e) => {
    if (expandable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      onToggle && onToggle();
    }
    
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

  if (!title) {
    return (
      <div className="mb-2" role="group">
        {children}
      </div>
    );
  }

  return (
    <div className="mb-2" role="group" aria-labelledby={`section-${title}`}>
      {expandable ? (
        <button
          type="button"
          className="w-full px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left
                   hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 focus:ring-inset
                   transition-colors duration-200 flex items-center justify-between cursor-pointer"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-expanded={expanded}
          aria-controls={`section-content-${title}`}
          tabIndex={0}
        >
          <span id={`section-${title}`}>{title}</span>
          <span 
            className="text-gray-500 ml-2 transition-transform duration-200 ease-in-out"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight size={14} />
          </span>
          <span className="sr-only">
            {expanded ? 'Collapse' : 'Expand'} {title} section
          </span>
        </button>
      ) : (
        <h3 
          id={`section-${title}`}
          className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          {title}
        </h3>
      )}
      
      {/* Controlled height transition to prevent scrollbar issues */}
      <div 
        id={`section-content-${title}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: expandable ? height : 'auto' }}
        role="group"
        aria-labelledby={`section-${title}`}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarSection;