"use client";

import React, { useState, useEffect } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Users,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  UserPlus,
} from "lucide-react";
import { adminService, TeacherDetails } from "@/lib/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TeachersPage: React.FC = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(
    new Set()
  );

  // Load teachers data
  const loadTeachers = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      }

      const teachersData = await adminService.getTeachersWithDetails();
      setTeachers(teachersData);

      if (showRefreshToast) {
        toast.success("Teachers data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error("Failed to load teachers data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  // Toggle teacher expansion
  const toggleTeacher = (teacherId: number) => {
    const newExpanded = new Set(expandedTeachers);
    if (newExpanded.has(teacherId)) {
      newExpanded.delete(teacherId);
    } else {
      newExpanded.add(teacherId);
    }
    setExpandedTeachers(newExpanded);
  };

  // Get total statistics
  const totalClasses = teachers.reduce(
    (sum, teacher) => sum + teacher.classes.length,
    0
  );
  const totalStudents = teachers.reduce(
    (sum, teacher) =>
      sum +
      teacher.classes.reduce((classSum, cls) => classSum + cls.studentCount, 0),
    0
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading teachers data...</p>
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Teachers Management
              </h1>
              <p className="text-muted-foreground">
                Manage teachers, their classes, and student assignments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTeachers(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Teachers
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teachers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active teachers in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClasses}</div>
                <p className="text-xs text-muted-foreground">
                  Classes being taught
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Students under teachers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Teachers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Teachers & Their Classes</CardTitle>
              <CardDescription>
                Detailed view of teachers, their subjects, and student
                assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teachers.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Teachers Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No teachers have been registered in the system yet.
                  </p>
                  <Button onClick={() => router.push("/register")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Teacher
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <Collapsible
                      key={teacher.id}
                      open={expandedTeachers.has(teacher.id)}
                      onOpenChange={() => toggleTeacher(teacher.id)}
                    >
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <CardTitle className="text-lg">
                                    {teacher.name}
                                  </CardTitle>
                                  <CardDescription>
                                    {teacher.email}
                                  </CardDescription>
                                </div>
                                <Badge
                                  variant={
                                    teacher.sectionCount >= teacher.maxSections
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {teacher.sectionCount}/{teacher.maxSections}{" "}
                                  Sections
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {teacher.classes.reduce(
                                    (sum, cls) => sum + cls.studentCount,
                                    0
                                  )}{" "}
                                  Students
                                </Badge>
                                {expandedTeachers.has(teacher.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent>
                            {teacher.classes.length === 0 ? (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">
                                  This teacher is not assigned to any classes
                                  yet.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <h4 className="font-semibold">
                                  Classes & Students:
                                </h4>
                                {teacher.classes.map((classItem) => (
                                  <div
                                    key={classItem.id}
                                    className="border rounded-lg p-4"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <h5 className="font-medium">
                                          {classItem.name} - Section{" "}
                                          {classItem.section}
                                        </h5>
                                        <p className="text-sm text-muted-foreground">
                                          {classItem.studentCount} student
                                          {classItem.studentCount !== 1
                                            ? "s"
                                            : ""}
                                        </p>
                                      </div>
                                      <Badge variant="outline">
                                        {classItem.studentCount} Students
                                      </Badge>
                                    </div>

                                    {classItem.students.length > 0 ? (
                                      <div className="space-y-2">
                                        <h6 className="text-sm font-medium text-muted-foreground">
                                          Students in this class:
                                        </h6>
                                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                          {classItem.students.map((student) => (
                                            <div
                                              key={student.id}
                                              className="flex items-center space-x-2 p-2 bg-muted rounded"
                                            >
                                              <Users className="h-3 w-3 text-blue-600" />
                                              <span className="text-sm">
                                                {student.name} (Age:{" "}
                                                {student.age})
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        No students assigned to this class yet.
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
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

export default TeachersPage;
