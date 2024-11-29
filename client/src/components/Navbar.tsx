import React from "react";
import { useAuth } from "@/stores/auth-store"; // Importing the useAuth hook from Zustand store

const Navbar: React.FC = () => {
  const { logout } = useAuth(); // Get the logout function from Zustand store

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">IMB Connect</div>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
            Profile
          </button>
          <button
            onClick={handleLogout} // On button click, trigger the logout
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
