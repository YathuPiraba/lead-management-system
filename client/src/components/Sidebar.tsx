// components/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="flex flex-col space-y-6">
        <Link href="/admin">
          <a className="text-xl font-semibold hover:text-gray-400">Dashboard</a>
        </Link>
        <Link href="/admin/leads">
          <a className="text-lg hover:text-gray-400">Leads</a>
        </Link>
        <Link href="/admin/users">
          <a className="text-lg hover:text-gray-400">Users</a>
        </Link>
        <Link href="/admin/settings">
          <a className="text-lg hover:text-gray-400">Settings</a>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
