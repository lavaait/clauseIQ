import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import './occ-colors.css';

const Header = ({ title, isOpen, setIsOpen }) => {
  return (
    <header className="bg-occ-secondary-white border-b border-occ-secondary-gray shadow-sm">
      <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Section - Menu + Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-occ-secondary-gray hover:bg-occ-blue hover:text-white text-occ-blue-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-1 sm:focus:ring-offset-2 touch-manipulation"
                aria-label="Open menu"
              >
                <Menu size={18} className="sm:hidden" />
                <Menu size={20} className="hidden sm:block" />
              </button>
            )}
            
            {/* Responsive Title */}
            <div className="flex items-center min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-occ-blue-gradient bg-clip-text text-transparent leading-tight truncate">
                {title}
              </h1>
            </div>
          </div>
          
          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            {/* Search Button */}
            <button className="group p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-occ-secondary-gray hover:bg-occ-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-1 sm:focus:ring-offset-2 touch-manipulation">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 occ-gray group-hover:text-white transition-colors duration-200" />
            </button>
            
            {/* User Button */}
            <button className="group p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-occ-blue-gradient hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-occ-blue focus:ring-offset-1 sm:focus:ring-offset-2 touch-manipulation">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;