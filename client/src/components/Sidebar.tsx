import React from "react";
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
import { useTheme } from "@/contexts/theme-context";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const roleId = user?.roleId;
  const { isDarkMode } = useTheme();

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
        "h-full border-r transition-all duration-300 flex flex-col",
        isDarkMode
          ? "bg-customDark border-gray-700"
          : "bg-white border-gray-200"
      )}
    >
      <div
        className={cn(
          "p-4 text-gray-700 flex items-center gap-3",
          isDarkMode && "text-gray-200"
        )}
      >
        <Image
          src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg"
          width={48}
          height={48}
          alt="IBM Connect"
          className="h-8 w-8 object-contain"
        />
        {!isCollapsed && <span className="font-bold text-lg">IBM Connect</span>}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <div className="flex flex-col gap-3">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (pathname === "/missed-followup" && link.href === "/followups");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors relative group",
                  isActive
                    ? isDarkMode
                      ? "bg-blue-900 text-blue-300"
                      : "bg-blue-50 text-blue-600"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    : "text-gray-600 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{link.title}</span>}
                {isCollapsed && (
                  <div
                    className={cn(
                      "absolute left-full ml-2 px-2 py-1 text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all",
                      isDarkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-900 text-white"
                    )}
                  >
                    {link.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <div
        className={cn(
          "p-4 border-t",
          isDarkMode ? "border-gray-700" : "border-gray-200"
        )}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-center",
            isDarkMode
              ? "text-gray-200 hover:bg-gray-700 hover:text-white"
              : "text-black"
          )}
          onClick={onToggle}
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
