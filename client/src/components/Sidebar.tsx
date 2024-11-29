import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  Bell,
  Users,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const roleId = user?.roleId;

  const sidebarLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Call Logs",
      href: "/call-logs",
      icon: Phone,
    },
    {
      title: "Follow-ups",
      href: "/followups",
      icon: Bell,
    },
    {
      title: "Students",
      href: "/students",
      icon: Users,
    },
    ...(roleId === 1
      ? [
          {
            title: "Staff",
            href: "/staff",
            icon: UserCircle,
          },
        ]
      : []),
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-white border-r transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and Company Name */}
      <div className="p-4 flex items-center gap-3">
        <Image
          src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg"
          width={48}
          height={48}
          alt="IBM Connect"
          className="h-8 w-8 object-contain"
        />
        <span
          className={cn(
            "font-bold text-lg transition-opacity duration-300",
            isCollapsed ? "opacity-0 hidden" : "opacity-100"
          )}
        >
          IBM Connect
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300",
                  isCollapsed ? "opacity-0 hidden" : "opacity-100"
                )}
              >
                {link.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
