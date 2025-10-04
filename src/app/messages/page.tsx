"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ComingSoon from "@/components/ComingSoon";
import { MessageSquare } from "lucide-react";

const MessagesPage: React.FC = () => {
  const features = [
    "Receive and respond to student messages",
    "Group messaging for class announcements",
    "Parent-teacher communication portal",
    "Message threading and conversation history",
    "File attachments and media sharing",
    "Read receipts and delivery confirmations",
    "Message scheduling and automated responses",
    "Integration with school notification system",
  ];

  return (
    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
      <ComingSoon
        title="Student Messages"
        description="Communication platform for teachers, students, and parents"
        icon={<MessageSquare className="w-10 h-10" />}
        features={features}
        estimatedRelease="Q1 2024"
      />
    </ProtectedRoute>
  );
};

export default MessagesPage;
