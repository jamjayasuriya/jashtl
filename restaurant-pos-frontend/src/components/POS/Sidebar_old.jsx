import React from 'react';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-full w-16 bg-gray-800 text-white flex flex-col items-center py-4">
      <div className="mb-8">
        <span className="text-xl font-bold">POS</span>
      </div>
      <nav className="flex flex-col space-y-6">
        <button className="p-2 hover:bg-gray-700 rounded" title="Home">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-700 rounded" title="Sales">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;