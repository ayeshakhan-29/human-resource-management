"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Settings,
  LogOut,
  ChevronUp,
  ChevronRight,
  Home,
  FolderKanban,
  ListChecks,
  SquarePlus,
  Settings2,
  FileText,
  ArrowRightLeft,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: Home,
    },
    {
      title: "Task Management",
      icon: ListChecks,
      items: [
        {
          title: "All Tasks",
          url: "/manager/tasks/all-tasks",
          icon: ListChecks,
        },
        {
          title: "Add Task",
          url: "/manager/tasks/add",
          icon: SquarePlus,
        },
        {
          title: "Manage Tasks",
          url: "/manager/tasks/manage-tasks",
          icon: Settings2,
        },
      ],
    },
    {
      title: "Projects",
      icon: FolderKanban,
      items: [
        {
          title: "All Projects",
          url: "/manager/projects",
          icon: FolderKanban,
        },
        {
          title: "Manage Projects",
          url: "/manager/projects/manage-projects",
          icon: Settings2,
        },
      ],
    },
    {
      title: "Daily Work Records",
      url: "/manager/daily-work-records",
      icon: FileText,
    },
  ],
};

export function ManagerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setOpenMobile } = useSidebar();

  const handleSwitchToEmployee = () => {
    router.push("/employee/dashboard");
    setOpenMobile(false);
  };

  // Check if user's primary role is employee (meaning they're an employee who was assigned as project manager)
  const isEmployeeWithManagerRole = user?.role?.toLowerCase() === "employee";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/manager/dashboard" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HRM System</span>
                  <span className="truncate text-xs">Manager Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Switch to Employee Dashboard Button - only show if user's primary role is employee */}
        {isEmployeeWithManagerRole && (
          <SidebarGroup>
            <SidebarGroupContent>
              <Button
                onClick={handleSwitchToEmployee}
                className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Switch to Employee Dashboard
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                                    <subItem.icon />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0) || user?.fullName?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || user?.fullName}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}