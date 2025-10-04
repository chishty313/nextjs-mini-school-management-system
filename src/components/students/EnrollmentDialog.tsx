"use client";

import React, { useState, useEffect } from "react";
import { Student, Class } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2 } from "lucide-react";
import { classesService } from "@/lib/classes";
import { studentsService } from "@/lib/students";
import { toast } from "sonner";

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}) => {
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);

  // Load available classes when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableClasses();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedClassId("");
    }
  }, [open]);

  const loadAvailableClasses = async () => {
    try {
      setClassesLoading(true);
      const classesData = await classesService.getClasses();
      setAvailableClasses(classesData.classes);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setClassesLoading(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!student || !selectedClassId) return;

    // Check if selected class is full before attempting enrollment
    const selectedClass = availableClasses.find(
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
      setLoading(true);
      // Use updateStudent to set the classId
      await studentsService.updateStudent(student.id, {
        classId: parseInt(selectedClassId),
      });
      toast.success("Student enrolled successfully");
      onSuccess();
      onOpenChange(false);
      setSelectedClassId("");
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
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <span>Enroll Student</span>
          </DialogTitle>
          <DialogDescription>
            Enroll {student.name} to a class or section
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Student Information
            </h3>
            <div className="flex items-center space-x-3">
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {student.name}
              </Badge>
              <span className="text-sm text-gray-600">Age: {student.age}</span>
              <span className="text-sm text-gray-600">ID: #{student.id}</span>
            </div>
          </div>

          {/* Class selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Select Class to Enroll
            </label>
            {classesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading classes...</span>
              </div>
            ) : availableClasses.length > 0 ? (
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((classItem) => {
                    const isFull = (classItem.studentCount || 0) >= 5;
                    return (
                      <SelectItem
                        key={classItem.id}
                        value={classItem.id.toString()}
                        disabled={isFull}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {classItem.name} - {classItem.section}
                            </span>
                            {isFull && (
                              <Badge variant="destructive" className="text-xs">
                                FULL
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {classItem.studentCount || 0} / 5 students enrolled
                            {classItem.teacher &&
                              ` • Teacher: ${classItem.teacher.name}`}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No classes available for enrollment.</p>
                <p className="text-xs mt-1">
                  Please create classes first before enrolling students.
                </p>
              </div>
            )}
          </div>

          {/* Selected class info */}
          {selectedClassId && (
            <div
              className={`p-3 rounded-lg ${(() => {
                const selectedClass = availableClasses.find(
                  (c) => c.id.toString() === selectedClassId
                );
                return selectedClass && (selectedClass.studentCount || 0) >= 5
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200";
              })()}`}
            >
              <h4
                className={`font-medium text-sm mb-1 ${(() => {
                  const selectedClass = availableClasses.find(
                    (c) => c.id.toString() === selectedClassId
                  );
                  return selectedClass && (selectedClass.studentCount || 0) >= 5
                    ? "text-red-800"
                    : "text-blue-800";
                })()}`}
              >
                Selected Class
              </h4>
              {(() => {
                const selectedClass = availableClasses.find(
                  (c) => c.id.toString() === selectedClassId
                );
                const isFull =
                  selectedClass && (selectedClass.studentCount || 0) >= 5;
                return selectedClass ? (
                  <div
                    className={`text-sm ${
                      isFull ? "text-red-700" : "text-blue-700"
                    }`}
                  >
                    <div className="font-medium flex items-center space-x-2">
                      <span>
                        {selectedClass.name} - {selectedClass.section}
                      </span>
                      {isFull && (
                        <Badge variant="destructive" className="text-xs">
                          FULL
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs mt-1">
                      Students: {selectedClass.studentCount || 0} / 5
                      {selectedClass.teacher &&
                        ` • Teacher: ${selectedClass.teacher.name}`}
                      {isFull && (
                        <div className="text-red-600 font-medium mt-1">
                          ⚠️ This class is full and cannot accept more students
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnrollStudent}
              disabled={
                loading ||
                !selectedClassId ||
                availableClasses.length === 0 ||
                (() => {
                  const selectedClass = availableClasses.find(
                    (c) => c.id.toString() === selectedClassId
                  );
                  return (
                    selectedClass && (selectedClass.studentCount || 0) >= 5
                  );
                })()
              }
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll Student
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
