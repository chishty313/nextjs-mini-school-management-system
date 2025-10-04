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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  Search,
  Users,
  BookOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { studentsService } from "@/lib/students";
import { classesService } from "@/lib/classes";
import { toast } from "sonner";
import { Student, Class } from "@/types";

const EnrollmentPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        studentsService.getStudents({ page: 1, limit: 100 }),
        classesService.getClasses(),
      ]);

      setStudents(studentsData.students || []);
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error("Error loading enrollment data:", error);
      toast.error("Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unenrolled students
  const unenrolledStudents = filteredStudents.filter(
    (student) => !student.classId
  );

  // Get enrolled students
  const enrolledStudents = filteredStudents.filter(
    (student) => student.classId
  );

  // Handle enrollment
  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedClassId) {
      toast.error("Please select both student and class");
      return;
    }

    // Check if selected class is full before attempting enrollment
    const selectedClass = classes.find(
      (c) => c.id.toString() === selectedClassId
    );

    if (selectedClass && (selectedClass.studentCount || 0) >= 5) {
      toast.error(
        `Class "${selectedClass.name} - ${selectedClass.section}" is full. Maximum 5 students allowed per section.`,
        {
          duration: 5000,
        }
      );
      return;
    }

    try {
      setEnrolling(true);
      await classesService.enrollStudent(parseInt(selectedClassId), {
        studentId: selectedStudent.id,
      });

      toast.success(`${selectedStudent.name} enrolled successfully!`);
      setIsEnrollDialogOpen(false);
      setSelectedStudent(null);
      setSelectedClassId("");
      await loadData(); // Refresh data
    } catch (error: unknown) {
      console.error("Error enrolling student:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to enroll student";

      // Show specific error for class full scenario
      if (errorMessage.includes("is full")) {
        toast.error(errorMessage, {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Handle unenrollment
  const handleUnenrollStudent = async (student: Student) => {
    if (!student.classId) return;

    try {
      await studentsService.updateStudent(student.id, {
        name: student.name,
        age: student.age,
        classId: null,
      });

      toast.success(`${student.name} unenrolled successfully!`);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error unenrolling student:", error);
      toast.error("Failed to unenroll student");
    }
  };

  const openEnrollDialog = (student: Student) => {
    setSelectedStudent(student);
    setSelectedClassId("");
    setIsEnrollDialogOpen(true);
  };

  const handleRefresh = async () => {
    await loadData();
    toast.success("Data refreshed successfully!");
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "teacher"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading enrollment data...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "teacher"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Student Enrollment
              </h1>
              <p className="text-muted-foreground">
                Manage student enrollments in classes
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  All students in the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrolled Students
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enrolledStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students with class assignments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active classes for enrollment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Unenrolled Students */}
          <Card>
            <CardHeader>
              <CardTitle>
                Unenrolled Students ({unenrolledStudents.length})
              </CardTitle>
              <CardDescription>
                Students who are not enrolled in any class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unenrolledStudents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No unenrolled students found matching your search"
                      : "All students are enrolled in classes"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unenrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Not Enrolled</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => openEnrollDialog(student)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Enroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <CardTitle>
                Enrolled Students ({enrolledStudents.length})
              </CardTitle>
              <CardDescription>
                Students who are currently enrolled in classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No enrolled students found matching your search"
                      : "No students are enrolled in classes yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {student.class
                              ? `${student.class.name} - ${student.class.section}`
                              : "Unknown Class"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnenrollStudent(student)}
                          >
                            Unenroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Dialog */}
          <Dialog
            open={isEnrollDialogOpen}
            onOpenChange={setIsEnrollDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll Student</DialogTitle>
                <DialogDescription>
                  Select a class to enroll {selectedStudent?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Input
                    id="student"
                    value={selectedStudent?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => {
                        const isFull = (classItem.studentCount || 0) >= 5;
                        return (
                          <SelectItem
                            key={classItem.id}
                            value={classItem.id.toString()}
                            disabled={isFull}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span>
                                  {classItem.name} - {classItem.section}
                                </span>
                                {isFull && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    FULL
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {classItem.studentCount || 0} / 5 students
                                {classItem.teacher &&
                                  ` • Teacher: ${classItem.teacher.name}`}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEnrollDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEnrollStudent}
                    disabled={
                      enrolling ||
                      !selectedClassId ||
                      (() => {
                        const selectedClass = classes.find(
                          (c) => c.id.toString() === selectedClassId
                        );
                        return (
                          selectedClass &&
                          (selectedClass.studentCount || 0) >= 5
                        );
                      })()
                    }
                  >
                    {enrolling && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Enroll Student
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EnrollmentPage;
