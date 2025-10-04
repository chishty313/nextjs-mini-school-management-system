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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Calendar, Settings as SettingsIcon } from "lucide-react";
import { format } from "date-fns";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Account Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your profile information and account preferences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Your account details and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div>
                    <Badge
                      variant={
                        user?.role === "admin"
                          ? "destructive"
                          : user?.role === "teacher"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button disabled className="w-full">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Edit Profile (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Details</span>
                </CardTitle>
                <CardDescription>
                  Account creation and activity information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    User ID:
                  </span>
                  <span className="text-sm font-semibold">#{user?.id}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Account Created:
                  </span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {user?.createdAt
                        ? format(new Date(user.createdAt), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Last Updated:
                  </span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {user?.updatedAt
                        ? format(new Date(user.updatedAt), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" disabled className="w-full">
                  Change Password (Coming Soon)
                </Button>
                <Button variant="outline" disabled className="w-full">
                  Two-Factor Authentication (Coming Soon)
                </Button>
                <Button variant="outline" disabled className="w-full">
                  Login History (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" disabled className="w-full">
                  Theme Settings (Coming Soon)
                </Button>
                <Button variant="outline" disabled className="w-full">
                  Notification Preferences (Coming Soon)
                </Button>
                <Button variant="outline" disabled className="w-full">
                  Language Settings (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Role-specific Information */}
          {user?.role && (
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
                <CardDescription>
                  Information specific to your role in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.role === "admin" && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      As an <strong>Administrator</strong>, you have full access
                      to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Create, edit, and delete students</li>
                      <li>Manage classes and enrollment</li>
                      <li>View all system statistics</li>
                      <li>Manage user accounts</li>
                    </ul>
                  </div>
                )}
                {user.role === "teacher" && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      As a <strong>Teacher</strong>, you have access to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>View and manage students</li>
                      <li>Access class information</li>
                      <li>Enroll students in classes</li>
                      <li>View student statistics</li>
                    </ul>
                  </div>
                )}
                {user.role === "student" && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      As a <strong>Student</strong>, you have access to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>View your personal dashboard</li>
                      <li>Access your enrolled classes</li>
                      <li>View your academic information</li>
                      <li>Update your profile settings</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
