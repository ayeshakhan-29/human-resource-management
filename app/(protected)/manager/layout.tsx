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
        console.log("No user found, redirecting to login");
        router.push("/auth/login");
        return;
      }

      const userRole = (user.role || "").toString().toLowerCase();
      console.log("Manager Layout - Checking access for user:", user.email);
      console.log("Manager Layout - User role:", userRole);
      console.log("Manager Layout - User object:", user);

      // Allow access if user has manager role
      if (userRole === "manager") {
        console.log("✅ User has manager role - granting access");
        setHasAccess(true);
        setIsCheckingAccess(false);
        return;
      }

      // Otherwise, check if the user is assigned as a project manager
      try {
        const id = parseInt((user.id as unknown as string) || "0", 10);
        if (id) {
          const resp = await getProjectsByManager(id, 1, 1);
          const hasProjects = (resp?.data?.length || 0) > 0;
          if (hasProjects) {
            console.log("✅ User is assigned as a project manager - granting access");
            setHasAccess(true);
            setIsCheckingAccess(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Error checking project manager assignments:", err);
      }

      // User doesn't have manager role
      console.log("❌ User doesn't have manager role");
      console.log("Current role:", userRole);
      console.log("Required role: manager");
      
      setHasAccess(false);
      setIsCheckingAccess(false);
      
      // Don't auto-redirect, show access denied message instead
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
              You need to have the &quot;Manager&quot; role to access this dashboard.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current Role:</strong> {user?.role || "employee"}
              </p>
              <p className="text-sm text-blue-700">
                Please contact your administrator to assign you the Manager role.
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