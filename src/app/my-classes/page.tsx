"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  User,
  Calendar,
  Users,
  RefreshCw,
  Loader2,
  GraduationCap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { studentsService } from "@/lib/students";

interface StudentClass {
  id: number;
  name: string;
  section: string;
  teacher: {
    id: number;
    name: string;
    email: string;
  } | null;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

const MyClassesPage: React.FC = () => {
  const {} = useAuth();
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyClasses = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Get student's specific classes
      const myClasses = await studentsService.getMyClasses();
      setClasses(myClasses);

      if (showRefreshToast) {
        toast.success("Classes refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes");
      setClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyClasses();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMyClasses(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your classes...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
              <p className="text-muted-foreground">
                View your enrolled courses and instructors
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMyClasses(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Classes you&apos;re enrolled in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Instructors
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    new Set(classes.map((c) => c.teacher?.id).filter(Boolean))
                      .size
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Different instructors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Classmates
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total students in your classes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Classes List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Enrolled Classes</CardTitle>
              <CardDescription>
                Detailed view of your classes, instructors, and classmates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Classes Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You are not enrolled in any classes yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact your administrator to get enrolled in classes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.map((classItem) => (
                    <Card
                      key={classItem.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">
                                {classItem.name}
                              </h3>
                              <Badge variant="secondary">
                                Section {classItem.section}
                              </Badge>
                            </div>

                            {classItem.teacher ? (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>
                                  Instructor:{" "}
                                  <span className="font-medium text-foreground">
                                    {classItem.teacher.name}
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>No instructor assigned</span>
                              </div>
                            )}

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {classItem.studentCount || 0} students
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Started{" "}
                                  {classItem.createdAt
                                    ? format(
                                        new Date(classItem.createdAt),
                                        "MMM dd, yyyy"
                                      )
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            <Badge
                              variant={
                                classItem.teacher ? "default" : "secondary"
                              }
                              className={
                                classItem.teacher
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {classItem.teacher ? "Active" : "Pending"}
                            </Badge>

                            {classItem.teacher && (
                              <div className="text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Last updated{" "}
                                    {classItem.updatedAt
                                      ? format(
                                          new Date(classItem.updatedAt),
                                          "MMM dd"
                                        )
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {classItem.teacher && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">
                              Instructor Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Name:
                                </span>
                                <span className="ml-2 font-medium">
                                  {classItem.teacher?.name || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Email:
                                </span>
                                <span className="ml-2 font-medium">
                                  {classItem.teacher?.email || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MyClassesPage;
