import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="flex flex-col space-y-6">
        <Link
          href="/admin"
          className="text-xl font-semibold hover:text-gray-400"
        >
          Dashboard
        </Link>
        <Link href="/admin/leads" className="text-lg hover:text-gray-400">
          Leads
        </Link>
        <Link href="/admin/users" className="text-lg hover:text-gray-400">
          Users
        </Link>
        <Link href="/admin/settings" className="text-lg hover:text-gray-400">
          Settings
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
