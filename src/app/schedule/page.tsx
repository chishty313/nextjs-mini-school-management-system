"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ComingSoon from "@/components/ComingSoon";
import { Calendar } from "lucide-react";

const SchedulePage: React.FC = () => {
  const features = [
    "View and manage your class schedule",
    "Create recurring class sessions",
    "Handle schedule conflicts and room bookings",
    "Student attendance tracking during classes",
    "Schedule notifications and reminders",
    "Integration with school calendar system",
    "Substitute teacher management",
    "Class material and resource planning",
  ];

  return (
    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
      <ComingSoon
        title="Schedule Classes"
        description="Advanced class scheduling and management system for teachers"
        icon={<Calendar className="w-10 h-10" />}
        features={features}
        estimatedRelease="Q1 2024"
      />
    </ProtectedRoute>
  );
};

export default SchedulePage;
