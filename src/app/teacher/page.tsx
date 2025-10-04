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
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  FileText,
  MessageSquare,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  pendingTasks: number;
  completedThisWeek: number;
}

interface TeacherActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    pendingTasks: 0,
    completedThisWeek: 0,
  });
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get("/teacher/dashboard"),
        api.get("/teacher/activities"),
      ]);

      setStats(statsResponse.data.data);
      setActivities(activitiesResponse.data.data.activities);
    } catch (error) {
      console.error("Error loading teacher dashboard:", error);
      toast.error("Failed to load dashboard data");
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
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const statsConfig = [
    {
      title: "My Classes",
      value: stats.totalClasses.toString(),
      description: "Active classes",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      description: "Across all classes",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      description: "Assignments to grade",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Completed",
      value: stats.completedThisWeek.toString(),
      description: "This week",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const quickActions = [
    {
      title: "View My Classes",
      description: "See all classes you're teaching",
      icon: BookOpen,
      action: () => router.push("/classes"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Grade Assignments",
      description: "Review and grade student work",
      icon: FileText,
      action: () => router.push("/assignments"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Schedule Classes",
      description: "Manage your class schedule",
      icon: Calendar,
      action: () => router.push("/schedule"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Student Messages",
      description: "Check messages from students",
      icon: MessageSquare,
      action: () => router.push("/messages"),
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const [upcomingClasses, setUpcomingClasses] = useState<
    {
      id: number;
      name: string;
      section: string;
      studentCount: number;
      createdAt: string;
    }[]
  >([]);

  const loadUpcomingClasses = async () => {
    try {
      const response = await api.get("/teacher/classes");
      const classes = response.data.data.classes || [];
      setUpcomingClasses(classes.slice(0, 3)); // Show first 3 classes
    } catch (error) {
      console.error("Error loading upcoming classes:", error);
    }
  };

  useEffect(() => {
    loadUpcomingClasses();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";

    return `${greeting}, ${user?.name}!`;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getWelcomeMessage()}
              </h1>
              <p className="text-muted-foreground">
                Welcome to your teacher dashboard. Here&apos;s your teaching
                overview.
              </p>
            </div>
            <div className="flex items-center space-x-2">
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
              <Badge variant="default" className="text-sm px-3 py-1">
                TEACHER
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsConfig.map((stat, index) => (
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
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={action.action}
                  >
                    <div
                      className={`p-2 rounded-full text-white ${action.color}`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Your assigned classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <div>
                          <p className="font-medium">{classItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Section {classItem.section}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {classItem.studentCount || 0} students
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created{" "}
                          {new Date(classItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No classes assigned yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your recent teaching activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No recent activities
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;
