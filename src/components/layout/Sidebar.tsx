"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  UserPlus,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case "admin":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
        return "/student";
      default:
        return "/dashboard";
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: getRoleDashboard(),
      icon: Home,
      roles: ["admin", "teacher", "student"],
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
      roles: ["admin", "teacher"],
    },
    {
      name: "Teachers",
      href: "/teachers",
      icon: GraduationCap,
      roles: ["admin"],
    },
    {
      name: "Classes",
      href: "/classes",
      icon: BookOpen,
      roles: ["admin", "teacher"],
    },
    {
      name: "Enrollment",
      href: "/enrollment",
      icon: UserPlus,
      roles: ["admin", "teacher"],
    },
    {
      name: "My Classes",
      href: "/my-classes",
      icon: GraduationCap,
      roles: ["student"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-white border-r", className)}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <School className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">
          Mini School
        </span>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <Badge
                variant={
                  user?.role === "admin"
                    ? "destructive"
                    : user?.role === "teacher"
                    ? "default"
                    : "secondary"
                }
                className="text-xs"
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings and Logout */}
      <div className="p-4 border-t space-y-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            pathname === "/settings"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
