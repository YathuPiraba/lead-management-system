// components/layout/AdminLayout.tsx
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const Layout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-gray-100 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
