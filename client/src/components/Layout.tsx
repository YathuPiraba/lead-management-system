import React, { ReactNode, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const Layout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar - Dynamic width */}
      <aside
        className={`fixed inset-y-0 z-20 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-16"}`}
      >
        <div className="h-full bg-white shadow">
          <Sidebar isCollapsed={!isSidebarOpen} onToggle={toggleSidebar} />
        </div>
      </aside>

      {/* Main Content Wrapper - Dynamic margin */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* Navbar - Dynamic left offset */}
        <nav
          className={`fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "left-64" : "left-16"}`}
        >
          <div className="bg-white shadow">
            <Navbar />
          </div>
        </nav>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto pt-12">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
