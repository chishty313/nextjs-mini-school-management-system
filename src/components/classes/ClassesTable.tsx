"use client";

import React, { useState } from "react";
import { Class } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { format } from "date-fns";

interface ClassesTableProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classId: number) => void;
  onView: (classItem: Class) => void;
  onViewStudents: (classItem: Class) => void;
  onAssignTeacher?: (classItem: Class) => void;
  onRemoveTeacher?: (classId: number) => void;
  loading?: boolean;
}

const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  onEdit,
  onDelete,
  onView,
  onViewStudents,
  onAssignTeacher,
  onRemoveTeacher,
  loading = false,
}) => {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      onDelete(classToDelete.id);
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const canEdit = user?.role === "admin";
  const canDelete = user?.role === "admin";

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No classes found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">
                    {classItem.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{classItem.section}</Badge>
                  </TableCell>
                  <TableCell>
                    {classItem.teacher ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {classItem.teacher.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {classItem.teacher.email}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        No Teacher
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{classItem.studentCount || 0}</span>
                      {(classItem.studentCount || 0) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewStudents(classItem)}
                          className="h-6 px-2"
                        >
                          <Users className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(classItem.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(classItem)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewStudents(classItem)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Students
                        </DropdownMenuItem>
                        {canEdit && onAssignTeacher && !classItem.teacher && (
                          <DropdownMenuItem
                            onClick={() => onAssignTeacher(classItem)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Teacher
                          </DropdownMenuItem>
                        )}
                        {canEdit && onRemoveTeacher && classItem.teacher && (
                          <DropdownMenuItem
                            onClick={() => onRemoveTeacher(classItem.id)}
                            className="text-orange-600"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove Teacher
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(classItem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(classItem)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              class &quot;{classToDelete?.name} - {classToDelete?.section}&quot;
              and remove all student enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassesTable;
