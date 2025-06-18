import type React from "react";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
