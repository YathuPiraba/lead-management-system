import React, { ReactNode, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "@/contexts/theme-context";

interface AdminLayoutProps {
  children: ReactNode;
}

const Layout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode, theme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`h-screen flex overflow-hidden  ${theme.colors.text} `}>
      <aside
        className={`fixed inset-y-0 z-20 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-20"} ${
          isDarkMode ? "bg-gray-300" : "bg-gray-100"
        } `}
      >
        <div className="h-full shadow overflow-y-auto side-scroll">
          <Sidebar isCollapsed={!isSidebarOpen} onToggle={toggleSidebar} />
        </div>
      </aside>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <nav
          className={`fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "left-64" : "left-20"}`}
        >
          <div
            className={`${isDarkMode ? "bg-gray-300" : "bg-gray-50"} shadow`}
          >
            <Navbar />
          </div>
        </nav>
        <main
          className={` ${
            isDarkMode ? "bg-customDark" : "bg-gray-100"
          } flex-1 overflow-y-auto pt-12`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
