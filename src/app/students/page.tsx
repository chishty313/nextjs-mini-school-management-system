"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StudentsTable from "@/components/students/StudentsTable";
import StudentForm from "@/components/students/StudentForm";
import StudentDetails from "@/components/students/StudentDetails";
import EnrollmentDialog from "@/components/students/EnrollmentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Users, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Student,
  Class,
  CreateStudentData,
  UpdateStudentData,
  StudentsQuery,
} from "@/types";
import { studentsService } from "@/lib/students";
import { classesService } from "@/lib/classes";
import { toast } from "sonner";

const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Enrollment dialog
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [studentForEnrollment, setStudentForEnrollment] =
    useState<Student | null>(null);

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showUnenrolledOnly, setShowUnenrolledOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const limit = 10;

  // Cache for all students to avoid repeated database queries
  const [allStudentsCache, setAllStudentsCache] = useState<Student[]>([]);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds

  // Load initial data
  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [currentPage, selectedClassId, showUnenrolledOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search functionality
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadStudents();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadStudents();
      loadClasses();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, selectedClassId, searchTerm, showUnenrolledOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all students for caching (only when cache is expired)
  const loadAllStudentsForCache = async () => {
    try {
      const now = Date.now();
      if (
        now - cacheTimestamp < CACHE_DURATION &&
        allStudentsCache.length > 0
      ) {
        return allStudentsCache; // Use cached data
      }

      // Load all students with a large limit
      let allStudents: Student[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await studentsService.getStudents({
          page,
          limit: 100, // Maximum allowed by backend
        });

        allStudents = [...allStudents, ...response.students];
        hasMore = page < response.totalPages;
        page++;
      }

      setAllStudentsCache(allStudents);
      setCacheTimestamp(now);
      return allStudents;
    } catch (error) {
      console.error("Error loading all students for cache:", error);
      return allStudentsCache; // Fallback to existing cache
    }
  };

  const loadStudents = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Always use cache for consistent pagination and filtering
      if (forceRefresh) {
        setAllStudentsCache([]);
        setCacheTimestamp(0);
      }

      const cachedStudents = await loadAllStudentsForCache();

      // Apply all filters on cached data
      let filteredStudents = cachedStudents;

      // Apply class filter
      if (selectedClassId && selectedClassId !== "all") {
        filteredStudents = filteredStudents.filter(
          (student) => student.classId === parseInt(selectedClassId)
        );
      }

      // Apply search filter
      if (searchTerm) {
        filteredStudents = filteredStudents.filter(
          (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.age.toString().includes(searchTerm) ||
            student.id.toString().includes(searchTerm) ||
            (student.class?.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ??
              false) ||
            (student.class?.section
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ??
              false)
        );
      }

      // Apply unenrolled filter
      if (showUnenrolledOnly) {
        filteredStudents = filteredStudents.filter(
          (student) => !student.classId
        );
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      setStudents(paginatedStudents);
      setTotalPages(Math.ceil(filteredStudents.length / limit));
      setTotalStudents(filteredStudents.length);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to load students: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const classesData = await classesService.getClasses();
      setClasses(classesData.classes);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to load classes: " + errorMessage);
    }
  };

  const handleCreateStudent = async (
    data: CreateStudentData | UpdateStudentData
  ) => {
    try {
      setFormLoading(true);
      await studentsService.createStudent(data as CreateStudentData);
      toast.success("Student created successfully");

      // Force refresh cache and reload
      loadStudents(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to create student: " + errorMessage);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStudent = async (
    data: CreateStudentData | UpdateStudentData
  ) => {
    if (!selectedStudent) return;

    try {
      setFormLoading(true);
      await studentsService.updateStudent(
        selectedStudent.id,
        data as UpdateStudentData
      );
      toast.success("Student updated successfully");

      // Force refresh cache and reload
      loadStudents(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to update student: " + errorMessage);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await studentsService.deleteStudent(studentId);
      toast.success("Student deleted successfully");

      // Force refresh cache and reload
      loadStudents(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete student: " + errorMessage);
    }
  };

  const handleUnenrollStudent = async (studentId: number) => {
    try {
      await studentsService.unenrollStudent(studentId);
      toast.success("Student unenrolled successfully");

      // Force refresh cache and reload
      loadStudents(true);
      loadClasses(); // Refresh classes to update student counts
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to unenroll student: " + errorMessage);
    }
  };

  const handleEnrollStudent = (student: Student) => {
    setStudentForEnrollment(student);
    setEnrollmentOpen(true);
  };

  const handleEnrollmentSuccess = () => {
    // Force refresh cache and reload
    loadStudents(true);
    loadClasses(); // Refresh classes to update student counts
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const handleRefresh = async () => {
    await Promise.all([loadStudents(), loadClasses()]);
    toast.success("Data refreshed successfully!");
  };

  const filteredStudentsCount = students?.length || 0;

  return (
    <ProtectedRoute allowedRoles={["admin", "teacher"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">
                Manage student information and enrollment
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              {user?.role === "admin" && (
                <Button onClick={handleAddStudent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  All students in system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  With Classes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students?.filter((s) => s.classId).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled students
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Without Classes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students?.filter((s) => !s.classId).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unassigned students
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Age
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students && students.length > 0
                    ? Math.round(
                        students.reduce((sum, s) => sum + s.age, 0) /
                          students.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Years old</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <CardDescription>
                Filter and search through students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students by name, age, ID, or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} - {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unenrolled-only"
                    checked={showUnenrolledOnly}
                    onCheckedChange={(checked) =>
                      setShowUnenrolledOnly(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="unenrolled-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show unenrolled students only
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Students List</CardTitle>
                  <CardDescription>
                    {filteredStudentsCount} of {totalStudents} students
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedClassId && selectedClassId !== "all" && (
                    <Badge variant="secondary">
                      Class:{" "}
                      {
                        classes.find((c) => c.id.toString() === selectedClassId)
                          ?.name
                      }
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary">Search: {searchTerm}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StudentsTable
                students={students}
                classes={classes}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onView={handleViewStudent}
                onUnenroll={
                  user?.role === "admin" || user?.role === "teacher"
                    ? handleUnenrollStudent
                    : undefined
                }
                onEnroll={
                  user?.role === "admin" || user?.role === "teacher"
                    ? handleEnrollStudent
                    : undefined
                }
                loading={loading}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Form Dialog */}
        <StudentForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
          student={selectedStudent}
          classes={classes}
          loading={formLoading}
        />

        {/* Student Details Dialog */}
        <StudentDetails
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          student={selectedStudent}
          classes={classes}
        />

        {/* Enrollment Dialog */}
        <EnrollmentDialog
          open={enrollmentOpen}
          onOpenChange={setEnrollmentOpen}
          student={studentForEnrollment}
          onSuccess={handleEnrollmentSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentsPage;
