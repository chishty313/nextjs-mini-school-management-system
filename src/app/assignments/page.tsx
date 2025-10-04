"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ComingSoon from "@/components/ComingSoon";
import { FileText } from "lucide-react";

const AssignmentsPage: React.FC = () => {
  const features = [
    "Create and manage assignments for your classes",
    "Grade student submissions with detailed feedback",
    "Track assignment completion and due dates",
    "Rubric-based grading system",
    "Plagiarism detection and originality reports",
    "Student submission tracking and notifications",
    "Grade book integration and analytics",
    "Parent and student grade notifications",
  ];

  return (
    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
      <ComingSoon
        title="Grade Assignments"
        description="Complete assignment management and grading system for teachers"
        icon={<FileText className="w-10 h-10" />}
        features={features}
        estimatedRelease="Q1 2024"
      />
    </ProtectedRoute>
  );
};

export default AssignmentsPage;
