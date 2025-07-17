import React from 'react';
import { Search, User, Menu } from 'lucide-react';

const Header = ({ title, isOpen, setIsOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 flex-shrink-0 text-gray-500 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4 ml-auto">
          <div className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <div className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;