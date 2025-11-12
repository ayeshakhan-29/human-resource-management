"use client";

import { ReactNode } from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900">
        <ClientSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header breadcrumbs={[{ label: "Client Portal" }]} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
