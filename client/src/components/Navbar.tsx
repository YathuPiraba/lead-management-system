// components/Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">IMB Connect</div>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
            Profile
          </button>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
