"use client";

import React from "react";
import { Student, Class } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, User, GraduationCap, Clock } from "lucide-react";
import { format } from "date-fns";

interface StudentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  classes: Class[];
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
  open,
  onOpenChange,
  student,
  classes,
}) => {
  if (!student) return null;

  const getClassName = (classId?: number) => {
    if (!classId) return null;
    const classInfo = classes.find((c) => c.id === classId);
    return classInfo
      ? `${classInfo.name} - ${classInfo.section}`
      : "Unknown Class";
  };

  const className = getClassName(student.classId || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Student Details</span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about {student.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="text-sm font-semibold">{student.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Age:</span>
                <span className="text-sm font-semibold">
                  {student.age} years
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Student ID:
                </span>
                <span className="text-sm font-semibold">#{student.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Class Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Current Class:
                </span>
                {className ? (
                  <Badge variant="secondary">{className}</Badge>
                ) : (
                  <Badge variant="outline">No Class Assigned</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Created:
                </span>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {format(new Date(student.createdAt), "PPP")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Last Updated:
                </span>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {format(new Date(student.updatedAt), "PPP")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>
                Other relevant details about the student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                {student.classId
                  ? `This student is currently enrolled in ${className}.`
                  : "This student is not currently assigned to any class."}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetails;
