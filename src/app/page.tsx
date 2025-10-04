"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect based on user role
        switch (user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "teacher":
            router.push("/teacher");
            break;
          case "student":
            router.push("/student");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}
