import React from 'react';
import { Search, User, Menu } from 'lucide-react';

const Header = ({ title, isOpen, setIsOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2   border-gray-300 text-black hover:bg-slate-700 transition-all  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
          <User className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default Header;
