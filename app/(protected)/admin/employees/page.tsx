"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { AddEmployeeForm } from "@/components/add-employee-form";
import {
  getAllEmployees,
  updateEmployeeStatus,
} from "@/lib/actions/employee.actions";
import { Employee } from "@/lib/types/employee.types";

// SWR fetcher function
const fetcher = async () => {
  const response = await getAllEmployees();
  return response.data;
};

// Format employee name for avatar
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    active: { label: "Active", variant: "default" as const },
    inactive: { label: "Inactive", variant: "secondary" as const },
    suspended: { label: "Suspended", variant: "destructive" as const },
  };

  const { label, variant } = statusMap[status as keyof typeof statusMap] || {
    label: status,
    variant: "outline" as const,
  };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    data: employees,
    error,
    isLoading,
    mutate,
  } = useSWR<Employee[]>("employees", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const handleStatusUpdate = async (
    employeeId: number,
    newStatus: "active" | "inactive" | "suspended"
  ) => {
    try {
      await updateEmployeeStatus(employeeId, newStatus);
      toast.success(`Employee status updated to ${newStatus}`);
      mutate(); // Revalidate the data
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update employee status"
      );
    }
  };

  const filteredEmployees =
    employees?.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load employees. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Employee Information" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees?.map(emp => emp.role)).size || 0}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {Array.from(new Set(employees?.map(emp => emp.role))).join(', ') || 'No departments'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees?.filter(emp => emp.status === "active").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees?.filter(emp => emp.status === "inactive").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Inactive accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>
                  Manage your team members and their details
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search employees..."
                    className="w-full pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new employee to the system.
                      </DialogDescription>
                    </DialogHeader>
                    <AddEmployeeForm
                      onSuccess={() => {
                        setIsAddDialogOpen(false);
                        mutate(); // Refresh the list after adding
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(employee.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          {employee.fullName}
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell>
                        {employee.lastLogin
                          ? format(
                              new Date(employee.lastLogin),
                              "MMM d, yyyy h:mm a"
                            )
                          : "Never logged in"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(employee.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const newStatus =
                                  employee.status === "active"
                                    ? "inactive"
                                    : "active";
                                handleStatusUpdate(employee.id, newStatus);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {employee.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleStatusUpdate(employee.id, "suspended")
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
