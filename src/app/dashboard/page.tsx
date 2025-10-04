"use client";

import React from "react";
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
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Classes",
      value: "24",
      change: "+3%",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Teachers",
      value: "48",
      change: "+5%",
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Enrollment Rate",
      value: "94%",
      change: "+2%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New student enrolled",
      details: "John Doe joined Class 10-A",
      time: "2 hours ago",
      type: "enrollment",
    },
    {
      id: 2,
      action: "Class schedule updated",
      details: "Mathematics class moved to 2 PM",
      time: "4 hours ago",
      type: "schedule",
    },
    {
      id: 3,
      action: "New teacher added",
      details: "Sarah Johnson joined as Physics teacher",
      time: "1 day ago",
      type: "staff",
    },
    {
      id: 4,
      action: "Student transferred",
      details: "Mike Wilson moved from Class 9-B to 9-A",
      time: "2 days ago",
      type: "transfer",
    },
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";

    return `${greeting}, ${user?.name}!`;
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    <span className="text-green-600">{stat.change}</span> from
                    last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case "teacher":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Classes you are teaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Active classes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Students</CardTitle>
                <CardDescription>Students in your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Across all classes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Assignments to grade
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "student":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Classes you are enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Active enrollments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Assignments and tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getWelcomeMessage()}
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening in your school today.
              </p>
            </div>
            <Badge
              variant={
                user?.role === "admin"
                  ? "destructive"
                  : user?.role === "teacher"
                  ? "default"
                  : "secondary"
              }
              className="text-sm px-3 py-1"
            >
              {user?.role?.toUpperCase()}
            </Badge>
          </div>

          {/* Role-specific content */}
          {getRoleSpecificContent()}

          {/* Recent Activities */}
          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest updates from your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
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
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
