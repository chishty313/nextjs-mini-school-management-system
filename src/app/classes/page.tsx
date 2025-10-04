"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClassesTable from "@/components/classes/ClassesTable";
import ClassForm from "@/components/classes/ClassForm";
import TeacherAssignmentDialog from "@/components/classes/TeacherAssignmentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen, Users, RefreshCw, Edit } from "lucide-react";
import { Class, CreateClassData, UpdateClassData, Student } from "@/types";
import { classesService } from "@/lib/classes";
import { studentsService } from "@/lib/students";
import { toast } from "sonner";
import { format } from "date-fns";
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

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Students dialog
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Class details dialog
  const [classDetailsOpen, setClassDetailsOpen] = useState(false);

  // Teacher assignment dialog
  const [teacherAssignmentOpen, setTeacherAssignmentOpen] = useState(false);
  const [classForTeacherAssignment, setClassForTeacherAssignment] =
    useState<Class | null>(null);

  // Cache for classes to avoid repeated database queries
  const [classesCache, setClassesCache] = useState<Class[]>([]);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds

  // Load initial data
  useEffect(() => {
    loadClasses();
    loadUniqueStudentCount();
  }, []);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadClasses();
      loadUniqueStudentCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Check if we can use cached data
      const now = Date.now();
      if (now - cacheTimestamp < CACHE_DURATION && classesCache.length > 0) {
        setClasses(classesCache);
        setLoading(false);
        return;
      }

      // Load fresh data from database
      const classesData = await classesService.getClasses();
      setClasses(classesData.classes);

      // Update cache
      setClassesCache(classesData.classes);
      setCacheTimestamp(now);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to load classes: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classId: number) => {
    try {
      setStudentsLoading(true);
      const students = await classesService.getClassStudents(classId);
      setClassStudents(students);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to load class students: " + errorMessage);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCreateClass = async (data: CreateClassData | UpdateClassData) => {
    try {
      setFormLoading(true);
      await classesService.createClass(data as CreateClassData);
      toast.success("Class created successfully");
      loadClasses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to create class: " + errorMessage);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateClass = async (data: CreateClassData | UpdateClassData) => {
    if (!selectedClass) return;

    try {
      setFormLoading(true);
      await classesService.updateClass(
        selectedClass.id,
        data as UpdateClassData
      );
      toast.success("Class updated successfully");
      loadClasses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to update class: " + errorMessage);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    try {
      await classesService.deleteClass(classId);
      toast.success("Class deleted successfully");
      loadClasses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to delete class: " + errorMessage);
    }
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormOpen(true);
  };

  const handleViewClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setClassDetailsOpen(true);
  };

  const handleViewStudents = async (classItem: Class) => {
    setSelectedClass(classItem);
    setStudentsDialogOpen(true);
    await loadClassStudents(classItem.id);
  };

  const handleRefresh = async () => {
    await Promise.all([loadClasses(), loadUniqueStudentCount()]);
    toast.success("Data refreshed successfully!");
  };

  const handleAddClass = () => {
    setSelectedClass(null);
    setFormOpen(true);
  };

  const handleAssignTeacher = (classItem: Class) => {
    setClassForTeacherAssignment(classItem);
    setTeacherAssignmentOpen(true);
  };

  const handleRemoveTeacher = async (classId: number) => {
    try {
      await classesService.removeTeacher(classId);
      toast.success("Teacher removed successfully");
      loadClasses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to remove teacher: " + errorMessage);
    }
  };

  const handleTeacherAssignmentSuccess = () => {
    // Force refresh cache and reload
    setClassesCache([]);
    setCacheTimestamp(0);
    loadClasses();
  };

  // Filter classes based on search term (use cache if available)
  const classesToFilter = classesCache.length > 0 ? classesCache : classes;
  const filteredClasses = classesToFilter.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.teacher?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
        false) ||
      (classItem.teacher?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
        false)
  );

  // Calculate unique students across all classes (not sum of all class counts)
  const [uniqueStudentCount, setUniqueStudentCount] = useState(0);

  // Load unique student count
  const loadUniqueStudentCount = async () => {
    try {
      // Get all students by paginating through all pages
      let allStudents: Student[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const studentsResponse = await studentsService.getStudents({
          page,
          limit: 100, // Maximum allowed by backend
        });

        allStudents = [...allStudents, ...studentsResponse.students];

        // Check if we've reached the last page
        hasMore = page < studentsResponse.totalPages;
        page++;
      }

      const uniqueStudents = new Set(allStudents.map((s) => s.id));
      setUniqueStudentCount(uniqueStudents.size);
    } catch (error) {
      console.error("Error loading unique student count:", error);
    }
  };

  const totalStudents = uniqueStudentCount;
  const averageStudentsPerClass =
    classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

  return (
    <ProtectedRoute allowedRoles={["admin", "teacher"]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
              <p className="text-muted-foreground">
                Manage class information and student enrollment
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              {user?.role === "admin" && (
                <Button onClick={handleAddClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredClasses.length} shown
                </p>
              </CardContent>
            </Card>
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
                  Across all classes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Class Size
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageStudentsPerClass}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students per class
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Classes with Teachers
                </CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classes.filter((cls) => cls.teacher).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of {classes.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Empty Classes
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    classes.filter((cls) => (cls.studentCount || 0) === 0)
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Without students
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Classes</span>
              </CardTitle>
              <CardDescription>
                Search through classes by name or section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes by name, section, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Classes Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classes List</CardTitle>
                  <CardDescription>
                    {filteredClasses.length} of {classes.length} classes
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {searchTerm && (
                    <Badge variant="secondary">Search: {searchTerm}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ClassesTable
                classes={filteredClasses}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                onView={handleViewClass}
                onViewStudents={handleViewStudents}
                onAssignTeacher={
                  user?.role === "admin" ? handleAssignTeacher : undefined
                }
                onRemoveTeacher={
                  user?.role === "admin" ? handleRemoveTeacher : undefined
                }
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Class Form Dialog */}
        <ClassForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={selectedClass ? handleUpdateClass : handleCreateClass}
          classItem={selectedClass}
          loading={formLoading}
        />

        {/* Teacher Assignment Dialog */}
        <TeacherAssignmentDialog
          open={teacherAssignmentOpen}
          onOpenChange={setTeacherAssignmentOpen}
          classItem={classForTeacherAssignment}
          onSuccess={handleTeacherAssignmentSuccess}
        />

        {/* Students Dialog */}
        <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Students in {selectedClass?.name} - {selectedClass?.section}
              </DialogTitle>
              <DialogDescription>
                {classStudents.length} students enrolled in this class
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : classStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>#{student.id}</TableCell>
                        <TableCell>
                          {format(new Date(student.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No students enrolled in this class yet.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Class Details Dialog */}
        <Dialog open={classDetailsOpen} onOpenChange={setClassDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedClass?.name} -{" "}
                {selectedClass?.section}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {selectedClass && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Class Name
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedClass.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Section
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedClass.section}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Students Enrolled
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedClass.studentCount || 0} / 5
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum 5 students per section
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Teacher
                      </h3>
                      <div className="text-lg font-medium">
                        {selectedClass.teacher ? (
                          <div className="space-y-1">
                            <div>{selectedClass.teacher.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedClass.teacher.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No teacher assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Created Date
                      </h3>
                      <p className="text-lg font-medium">
                        {format(
                          new Date(selectedClass.createdAt),
                          "MMM dd, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewStudents(selectedClass)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View Students ({selectedClass.studentCount || 0})
                      </Button>
                      {user?.role === "admin" && (
                        <Button
                          onClick={() => {
                            setClassDetailsOpen(false);
                            handleEditClass(selectedClass);
                          }}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Class
                        </Button>
                      )}
                    </div>
                    {user?.role === "admin" && (
                      <div className="flex gap-2">
                        {!selectedClass.teacher ? (
                          <Button
                            onClick={() => {
                              setClassDetailsOpen(false);
                              handleAssignTeacher(selectedClass);
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Assign Teacher
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setClassDetailsOpen(false);
                              handleRemoveTeacher(selectedClass.id);
                            }}
                            variant="outline"
                            className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Remove Teacher
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ClassesPage;
