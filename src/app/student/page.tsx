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
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { studentsService } from "@/lib/students";

interface ClassData {
  id: number;
  name: string;
  section: string;
  teacher?: {
    id: number;
    name: string;
    email: string;
  } | null;
  studentCount: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load student's classes data
      const myClasses = await studentsService.getMyClasses();
      setClasses(myClasses);

      if (showRefreshToast) {
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "My Classes",
      value: classes.length.toString(),
      description: "Active enrollments",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Instructors",
      value: new Set(
        classes.map((c) => c.teacher?.id).filter(Boolean)
      ).size.toString(),
      description: "Different teachers",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Classmates",
      value: classes
        .reduce((sum, c) => sum + (c.studentCount || 0), 0)
        .toString(),
      description: "Total students in your classes",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Achievements",
      value: "0",
      description: "Coming soon",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your classes today.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboardData(true)}
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

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your most used features quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div
                  className="p-4 rounded-lg border cursor-pointer transition-colors hover:shadow-md bg-blue-50 hover:bg-blue-100"
                  onClick={() => router.push("/my-classes")}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-50">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">View My Classes</h3>
                      <p className="text-xs text-muted-foreground">
                        Check your enrolled classes and instructors
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gray-50 opacity-60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500">
                        Assignments
                      </h3>
                      <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gray-50 opacity-60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500">
                        Schedule
                      </h3>
                      <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gray-50 opacity-60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-500">
                        Grades
                      </h3>
                      <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Your Classes</CardTitle>
              <CardDescription>
                Overview of your enrolled classes and instructors
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
                  <Button onClick={() => router.push("/my-classes")}>
                    View All Classes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.slice(0, 5).map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {classItem.name} - Section {classItem.section}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {classItem.teacher
                              ? `Instructor: ${classItem.teacher.name}`
                              : "No instructor assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {classItem.studentCount || 0} students
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push("/my-classes")}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {classes.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/my-classes")}
                      >
                        View All {classes.length} Classes
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentDashboard;
