"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Search, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { studentsService } from "@/lib/students";
import { classesService } from "@/lib/classes";
import { Student, Class } from "@/types";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  showMenuButton = false,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    students: Student[];
    classes: Class[];
  }>({ students: [], classes: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<
    {
      id: string;
      type: string;
      title: string;
      message: string;
      time: string;
      unread: boolean;
    }[]
  >([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Search functionality
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults({ students: [], classes: [] });
      setShowSearchResults(false);
      return;
    }

    // Only search if user is authenticated
    if (!user) {
      setSearchResults({ students: [], classes: [] });
      setShowSearchResults(false);
      return;
    }

    try {
      if (user.role === "student") {
        // For students, only search their classes
        const myClasses = await studentsService.getMyClasses();
        const filteredClasses = myClasses.filter(
          (cls: { name: string; section: string }) =>
            cls.name.toLowerCase().includes(term.toLowerCase()) ||
            cls.section.toLowerCase().includes(term.toLowerCase())
        );

        setSearchResults({
          students: [],
          classes: filteredClasses,
        });
      } else {
        // For admin and teacher, search all students and classes
        const [studentsResponse, classesResponse] = await Promise.all([
          studentsService.getStudents({ page: 1, limit: 50 }),
          classesService.getClasses(),
        ]);

        const filteredStudents = studentsResponse.students.filter((student) =>
          student.name.toLowerCase().includes(term.toLowerCase())
        );

        const filteredClasses = classesResponse.classes.filter(
          (cls) =>
            cls.name.toLowerCase().includes(term.toLowerCase()) ||
            cls.section.toLowerCase().includes(term.toLowerCase())
        );

        setSearchResults({
          students: filteredStudents,
          classes: filteredClasses,
        });
      }
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ students: [], classes: [] });
      setShowSearchResults(false);
    }
  };

  // Load notifications
  const loadNotifications = useCallback(async () => {
    // Only load notifications if user is authenticated
    if (!user) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    try {
      let sampleNotifications: Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        time: string;
        unread: boolean;
      }> = [];

      if (user.role === "student") {
        // For students, only show class-related notifications
        try {
          const myClasses = await studentsService.getMyClasses();
          sampleNotifications = myClasses.map(
            (
              cls: { name: string; section: string; createdAt: string },
              index: number
            ) => ({
              id: `class-${index}`,
              type: "class",
              title: "Your class update",
              message: `${cls.name} - ${cls.section} is available`,
              time: new Date(cls.createdAt).toLocaleTimeString(),
              unread: true,
            })
          );
        } catch {
          // If no classes, show a welcome notification
          sampleNotifications = [
            {
              id: "welcome",
              type: "welcome",
              title: "Welcome to the school system",
              message: "You can view your classes and assignments here",
              time: new Date().toLocaleTimeString(),
              unread: true,
            },
          ];
        }
      } else {
        // For admin and teacher, show student and class notifications
        const [studentsResponse, classesResponse] = await Promise.all([
          studentsService.getStudents({ page: 1, limit: 10 }),
          classesService.getClasses(),
        ]);

        const recentStudents = studentsResponse.students.slice(0, 3);
        const recentClasses = classesResponse.classes.slice(0, 2);

        sampleNotifications = [
          ...recentStudents.map((student, index) => ({
            id: `student-${index}`,
            type: "enrollment",
            title: "New student enrolled",
            message: `${student.name} joined ${
              student.class?.name || "the school"
            }`,
            time: new Date(student.createdAt).toLocaleTimeString(),
            unread: true,
          })),
          ...recentClasses.map((cls, index) => ({
            id: `class-${index}`,
            type: "class",
            title: "New class created",
            message: `${cls.name} - ${cls.section} was added`,
            time: new Date(cls.createdAt).toLocaleTimeString(),
            unread: true,
          })),
        ];
      }

      setNotifications(sampleNotifications);
      setNotificationCount(sampleNotifications.filter((n) => n.unread).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Set empty notifications on error
      setNotifications([]);
      setNotificationCount(0);
    }
  }, [user]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    // Only load notifications if user is authenticated
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle search result click
  const handleSearchResultClick = (type: "student" | "class") => {
    setSearchTerm("");
    setShowSearchResults(false);
    if (type === "student") {
      router.push("/students");
    } else {
      router.push("/classes");
    }
  };

  // Mark notifications as read when dropdown opens
  const handleNotificationsOpenChange = (open: boolean) => {
    setNotificationsOpen(open);
    if (open) {
      // Mark all notifications as read
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
      setNotificationCount(0);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search students, classes..."
            className="pl-10 w-64"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          />

          {/* Search Results Dropdown */}
          {showSearchResults &&
            (searchResults.students.length > 0 ||
              searchResults.classes.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.students.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Students
                    </p>
                    {searchResults.students.slice(0, 5).map((student) => (
                      <div
                        key={student.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => handleSearchResultClick("student")}
                      >
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          Age: {student.age} •{" "}
                          {student.class?.name || "No class"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.classes.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Classes
                    </p>
                    {searchResults.classes.slice(0, 5).map((cls) => (
                      <div
                        key={cls.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => handleSearchResultClick("class")}
                      >
                        <p className="text-sm font-medium">
                          {cls.name} - {cls.section}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls.studentCount || 0} students
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <DropdownMenu
          open={notificationsOpen}
          onOpenChange={handleNotificationsOpenChange}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3">
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
