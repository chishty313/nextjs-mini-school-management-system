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
  GraduationCap,
  TrendingUp,
  Settings,
  UserPlus,
  Calendar,
  BarChart3,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { dashboardService, DashboardStats, Activity } from "@/lib/dashboard";
import { toast } from "sonner";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State for real-time data
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeClasses: 0,
    totalTeachers: 0,
    enrollmentRate: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      }

      const data = await dashboardService.getDashboardData();
      setStats(data.stats);
      setActivities(data.activities);

      if (showRefreshToast) {
        toast.success("Dashboard data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Stats configuration
  const statsConfig = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Classes",
      value: stats.activeClasses.toString(),
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers.toString(),
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Enrollment Rate",
      value: `${stats.enrollmentRate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const quickActions = [
    {
      title: "Add New Student",
      description: "Register a new student in the system",
      icon: UserPlus,
      action: () => router.push("/students"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Manage Classes",
      description: "Create and manage class schedules",
      icon: Calendar,
      action: () => router.push("/classes"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "View Reports",
      description: "Access detailed analytics and reports",
      icon: BarChart3,
      action: () => router.push("/reports"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      action: () => router.push("/settings"),
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";

    return `${greeting}, ${user?.name}!`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return "🎓";
      case "class":
        return "📚";
      case "schedule":
        return "📅";
      case "staff":
        return "👨‍🏫";
      case "transfer":
        return "🔄";
      default:
        return "📝";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getWelcomeMessage()}
              </h1>
              <p className="text-muted-foreground">
                Welcome to your admin dashboard. Here&apos;s an overview of your
                school.
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
              <Badge variant="destructive" className="text-sm px-3 py-1">
                ADMINISTRATOR
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time data • Last updated:{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
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

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from your school</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No recent activities found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="text-lg mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
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

export default AdminDashboard;
