"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminLayout({
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
      if (!user) {
        router.push("/login");
        return;
      }

      const userRole = (user.role || "").toString().toLowerCase();
      if (userRole === "admin") {
        setHasAccess(true);
        setIsCheckingAccess(false);
      } else {
        router.push("/login");
      }
    };

    checkAccess();
  }, [user, router]);

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

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need to have the &quot;Admin&quot; role to access this section.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current Role:</strong> {user?.role || "employee"}
              </p>
              <p className="text-sm text-blue-700">
                Please contact your administrator to assign you the Admin role.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/employee/dashboard">
              <Button variant="outline">
                Go to Employee Dashboard
              </Button>
            </Link>
            <Link href="/manager/dashboard">
              <Button>
                Go to Manager Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
