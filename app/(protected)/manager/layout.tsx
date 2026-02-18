"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ManagerSidebar } from "@/components/manager-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProjectsByManager } from "@/lib/actions/project.action";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Check if user is authenticated
      if (!user) {
        router.push("/login");
        return;
      }

      const userRole = (user.role || "").toString().toLowerCase();

      // Allow access if user has manager or admin role
      if (userRole === "manager" || userRole === "admin") {
        setHasAccess(true);
        setIsCheckingAccess(false);
        return;
      }

      // Check if employee is assigned as a project manager
      if (userRole === "employee") {
        try {
          const token = localStorage.getItem("token");
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
          const response = await fetch(`${apiUrl}/auth/check-project-manager`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          
          if (data.success && data.isProjectManager) {
            setHasAccess(true);
            setIsCheckingAccess(false);
            return;
          }
        } catch (error) {
          console.error("Failed to check manager status:", error);
        }
      }

      // User doesn't have manager access
      setHasAccess(false);
      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [user, router]);

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show access denied message if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manager Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need to be assigned as a project manager or have the &quot;Manager&quot; role to access this dashboard.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current Role:</strong> {user?.role || "employee"}
              </p>
              <p className="text-sm text-blue-700">
                Please contact your administrator to assign you as a project manager or update your role.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/employee/dashboard">
              <Button variant="outline">
                Go to Employee Dashboard
              </Button>
            </Link>
            <Link href="/employee/profile">
              <Button>
                View My Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
