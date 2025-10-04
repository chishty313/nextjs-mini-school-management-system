"use client";

import React, { useState, useEffect } from "react";
import { Class } from "@/types";
import { UserDetails } from "@/lib/admin";
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
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { adminService } from "@/lib/admin";
import { classesService } from "@/lib/classes";
import { toast } from "sonner";

interface TeacherAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: Class | null;
  onSuccess: () => void;
}

const TeacherAssignmentDialog: React.FC<TeacherAssignmentDialogProps> = ({
  open,
  onOpenChange,
  classItem,
  onSuccess,
}) => {
  const [availableTeachers, setAvailableTeachers] = useState<UserDetails[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Load available teachers when dialog opens
  useEffect(() => {
    if (open && !classItem?.teacher) {
      loadAvailableTeachers();
    }
  }, [open, classItem]);

  const loadAvailableTeachers = async () => {
    try {
      setTeachersLoading(true);
      const teachers = await adminService.getAvailableTeachers();
      setAvailableTeachers(teachers);
    } catch (error) {
      console.error("Error loading available teachers:", error);
      toast.error("Failed to load available teachers");
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!classItem || !selectedTeacherId) return;

    try {
      setLoading(true);
      await classesService.assignTeacher(classItem.id, {
        teacherId: parseInt(selectedTeacherId),
      });
      toast.success("Teacher assigned successfully");
      onSuccess();
      onOpenChange(false);
      setSelectedTeacherId("");
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!classItem) return;

    try {
      setLoading(true);
      await classesService.removeTeacher(classItem.id);
      toast.success("Teacher removed successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Failed to remove teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {classItem.teacher ? (
              <>
                <UserMinus className="h-5 w-5 text-orange-500" />
                <span>Remove Teacher</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-blue-500" />
                <span>Assign Teacher</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {classItem.teacher
              ? `Remove teacher from ${classItem.name} - ${classItem.section}`
              : `Assign a teacher to ${classItem.name} - ${classItem.section}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current teacher info */}
          {classItem.teacher && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                Current Teacher
              </h3>
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {classItem.teacher.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {classItem.teacher.email}
                </span>
              </div>
            </div>
          )}

          {/* Teacher selection */}
          {!classItem.teacher && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Select Available Teacher
              </label>
              {teachersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading teachers...</span>
                </div>
              ) : availableTeachers.length > 0 ? (
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <span className="text-xs text-gray-500">
                            {teacher.email}
                          </span>
                          <span className="text-xs text-blue-600">
                            {teacher.sectionCount || 0}/5 sections
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No available teachers found.</p>
                  <p className="text-xs mt-1">
                    All teachers are currently assigned to classes.
                  </p>
                </div>
              )}
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
            {classItem.teacher ? (
              <Button
                onClick={handleRemoveTeacher}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserMinus className="mr-2 h-4 w-4" />
                Remove Teacher
              </Button>
            ) : (
              <Button
                onClick={handleAssignTeacher}
                disabled={
                  loading ||
                  !selectedTeacherId ||
                  availableTeachers.length === 0
                }
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Teacher
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAssignmentDialog;
