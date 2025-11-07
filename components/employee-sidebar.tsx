"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  User,
  Clock,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronUp,
  ChevronRight,
  Home,
  Bell,
  CreditCard,
  ListChecks,
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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getUnreadNotificationsCount } from "@/lib/actions/notification.actions";

const data = {
  user: {
    name: "John Smith",
    email: "john@company.com",
    avatar: "JS",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/employee/dashboard",
      icon: Home,
    },
    {
      title: "My Profile",
      url: "/employee/profile",
      icon: User,
    },
    {
      title: "Bank Information",
      url: "/employee/bank-info",
      icon: CreditCard,
    },

    {
      title: "Attendance",
      url: "/employee/attendance",
      icon: Clock,
    },
    {
      title: "Leave Management",
      icon: Calendar,
      items: [
        {
          title: "Apply for Leave",
          url: "/employee/leave/apply",
          icon: Calendar,
        },
        {
          title: "My Leave Requests",
          url: "/employee/leave/requests",
          icon: FileText,
        },
        {
          title: "Leave Balance",
          url: "/employee/leave/balance",
          icon: CreditCard,
        },
      ],
    },
     {
      title: "My Tasks",
      url: "/employee/tasks",
      icon: ListChecks,
    },
    {
      title: "Notifications",
      url: "/employee/notifications",
      icon: Bell,
    },
  ],
};

export function EmployeeSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id) {
        try {
          const count = await getUnreadNotificationsCount(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error("Failed to fetch unread notifications count:", error);
        }
      }
    };

    fetchUnreadCount();

    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Listen for notification read events
    const handleNotificationRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notificationRead', handleNotificationRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, [user?.id]);

  const handleNotificationClick = () => {
    router.push("/employee/tasks");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/employee/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HRM System</span>
                  <span className="truncate text-xs">Employee Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
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
                                  <Link href={subItem.url}>
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
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.title === "Notifications" && unreadCount > 0 && (
                          <span
                            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white cursor-pointer hover:bg-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNotificationClick();
                            }}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
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
                      {data.user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {data.user.name}
                    </span>
                    <span className="truncate text-xs">{data.user.email}</span>
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
                <DropdownMenuItem>
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
