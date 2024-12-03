import React from "react";
import { useAuth } from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out Successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className={`px-7 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Toggle Switch */}
        <div>
          <input
            type="checkbox"
            className="peer absolute -left-[65rem]"
            id="dn-toggle-bs"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <label
            htmlFor="dn-toggle-bs"
            className="toggle relative inline-block h-6 w-12 cursor-pointer overflow-clip rounded-full border border-sky-300 bg-sky-300 transition-colors duration-200 peer-checked:border-sky-800 peer-checked:bg-sky-800 peer-disabled:cursor-not-allowed peer-checked:[&_.crater]:opacity-100 peer-checked:[&_.star-1]:left-2 peer-checked:[&_.star-1]:top-3 peer-checked:[&_.star-1]:h-0.5 peer-checked:[&_.star-1]:w-0.5 peer-checked:[&_.star-2]:left-4 peer-checked:[&_.star-2]:top-1.5 peer-checked:[&_.star-2]:h-1 peer-checked:[&_.star-2]:w-1 peer-checked:[&_.star-3]:left-4 peer-checked:[&_.star-3]:top-4 peer-checked:[&_.star-3]:h-0.5 peer-checked:[&_.star-3]:w-0.5 peer-checked:[&_.toggle-handler]:-left-4 peer-checked:[&_.toggle-handler]:translate-x-10 peer-checked:[&_.toggle-handler]:rotate-0 peer-checked:[&_.toggle-handler]:bg-amber-100"
          >
            <span className="toggle-handler relative left-0 top-0 z-10 inline-block h-6 w-6 -rotate-45 rounded-full bg-amber-300 shadow transition-all duration-\[400ms\]">
              <span className="crater absolute left-1 top-2 h-px w-px rounded-full bg-amber-200 opacity-0 transition-opacity duration-200"></span>
              <span className="crater absolute left-2.5 top-3.5 h-1 w-1 rounded-full bg-amber-200 opacity-0 transition-opacity duration-200"></span>
              <span className="crater absolute left-3 top-1 h-1.5 w-1.5 rounded-full bg-amber-200 opacity-0 transition-opacity duration-200"></span>
            </span>
            <span className="star-1 absolute left-3 top-4 h-4 w-4 rounded-full bg-white transition-all duration-300"></span>
            <span className="star-2 absolute left-6 top-3.5 h-4 w-4 rounded-full bg-white transition-all duration-300"></span>
            <span className="star-3 absolute left-9 top-2 h-5 w-5 rounded-full bg-white transition-all duration-300"></span>
            <span className="sr-only">toggle switch</span>
          </label>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {/* Notification Button */}
          <Button className="relative bg-white rounded-full h-12 w-12 p-3 shadow-md">
            <Bell
              className=" text-gray-600"
              style={{
                width: "18px",
                height: "18px",
              }}
            />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full p-2 h-12 w-12 bg-white shadow-md">
                <Avatar className="h-12 w-12">
                  {user?.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.userName || "Profile"}
                    />
                  ) : (
                    <AvatarFallback>
                      {user?.userName?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 mt-0 mr-4">
              <Link href="/settings">
                <DropdownMenuItem className="flex items-center cursor-pointer p-1">
                  <Button className={`bg-gray-100 text-black hover:bg-gray-50`}>
                    <User className="mr-2 h-4 w-4 " />
                    Profile
                  </Button>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="flex items-center text-red-600 cursor-pointer p-1">
                <Button
                  onClick={handleLogout}
                  className={`bg-gray-100 text-black hover:bg-gray-50`}
                >
                  <LogOut className="mr-2 h-4 w-3" />
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
