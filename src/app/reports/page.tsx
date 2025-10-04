"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ComingSoon from "@/components/ComingSoon";
import { BarChart3 } from "lucide-react";

const ReportsPage: React.FC = () => {
  const features = [
    "Student performance analytics and trends",
    "Class attendance reports and statistics",
    "Teacher workload and efficiency metrics",
    "Financial reports and budget tracking",
    "Custom report builder with filters",
    "Export reports to PDF and Excel",
    "Automated report scheduling",
    "Interactive dashboards and charts",
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ComingSoon
        title="Reports & Analytics"
        description="Comprehensive reporting and analytics dashboard for school administrators"
        icon={<BarChart3 className="w-10 h-10" />}
        features={features}
        estimatedRelease="Q2 2024"
      />
    </ProtectedRoute>
  );
};

export default ReportsPage;
